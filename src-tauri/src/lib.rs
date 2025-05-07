use std::sync::LazyLock;

use futures::FutureExt;
use serde::Serialize;
use tauri::AppHandle;
use tauri::Emitter;
use tokio::net::UdpSocket;
use tokio::sync::{oneshot, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                let window = _app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![my_custom_command, listen_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn my_custom_command(message: String) {
    println!("{}", message);
}

#[derive(Clone, Serialize, Debug)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum ListenEvent<'a> {
    #[serde(rename_all = "camelCase")]
    Error { id: i32, reason: String },
    #[serde(rename_all = "camelCase")]
    MessageError { id: i32, reason: String },
    #[serde(rename_all = "camelCase")]
    Opened { id: i32 },
    #[serde(rename_all = "camelCase")]
    Closed { id: i32 },
    #[serde(rename_all = "camelCase")]
    RawData { id: i32, data: &'a [u8] },
}

static END_SIGNAL: LazyLock<(
    Mutex<oneshot::Sender<u32>>,
    Mutex<futures::future::Shared<oneshot::Receiver<u32>>>,
)> = LazyLock::new(|| {
    let (tx, rx) = oneshot::channel();
    (Mutex::new(tx), Mutex::new(rx.shared()))
});

#[tauri::command]
async fn listen_data(app: AppHandle, id: i32, url: String, forward: Option<String>) {
    let end_signal_lock = {
        let (mut new_tx, new_rx) = oneshot::channel();
        let mut tx = END_SIGNAL.0.lock().await;
        std::mem::swap(&mut *tx, &mut new_tx); // new_tx become old_tx
        new_tx.send(0).ok(); // notify old socket to release
        let mut rx = END_SIGNAL.1.lock().await; // wait old socket to release
        *rx = new_rx.shared();
        rx
    };

    let socket = match UdpSocket::bind(&url).await {
        Ok(s) => s,
        Err(e) => {
            app.emit(
                "on-data",
                ListenEvent::Error {
                    id,
                    reason: format!("Socket Open Failed ({:?})", e),
                },
            )
            .unwrap();
            return;
        }
    };

    println!("Start listening {}", url);
    app.emit("on-data", ListenEvent::Opened { id }).unwrap();

    // Receives a single datagram message on the socket.
    // If `buf` is too small to hold the message, it will be cut off.
    let mut buf = [0; 1500];
    loop {
        let end_signal = end_signal_lock.clone();
        let udp_message = tokio::select! {
            udp_message = socket.recv_from(&mut buf) => udp_message,
            _ = end_signal => {
                drop(socket); // the socket is closed here
                use tokio::time::{sleep, Duration};
                sleep(Duration::from_millis(500)).await; // system release socket maybe delayed somehow
                drop(end_signal_lock); // notify new socket to build
                break;
            }
        };

        match udp_message {
            Ok((amt, _)) => {
                let data = ListenEvent::RawData {
                    id,
                    data: &buf[..amt],
                };
                app.emit("on-data", data).unwrap();
                if let Some(forward) = &forward {
                    if let Err(e) = socket.send_to(&buf[..amt], &forward).await {
                        app.emit(
                            "on-data",
                            ListenEvent::MessageError {
                                id,
                                reason: format!("Forward Failed ({:?})", e),
                            },
                        )
                        .unwrap();
                    }
                }
            }
            Err(e) => {
                app.emit(
                    "on-data",
                    ListenEvent::Error {
                        id,
                        reason: format!("Socket Recv Failed ({:?})", e),
                    },
                )
                .unwrap();
                break;
            }
        }
    }
    app.emit("on-data", ListenEvent::Closed { id }).unwrap();
    println!("Stop listening {}", url);
}
