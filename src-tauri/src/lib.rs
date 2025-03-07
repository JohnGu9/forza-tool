use std::sync::LazyLock;

use futures::FutureExt;
use serde::Serialize;
use tauri::Emitter;
use tauri::{ipc::Channel, AppHandle};
use tokio::net::UdpSocket;
use tokio::sync::{oneshot, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
                // use tauri::Manager;
                // let window = app.get_webview_window("main").unwrap();
                // window.open_devtools();
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
    Error { reason: String },
    #[serde(rename_all = "camelCase")]
    MessageError { reason: String },
    #[serde(rename_all = "camelCase")]
    Opened {},
    #[serde(rename_all = "camelCase")]
    Closed {},
    #[serde(rename_all = "camelCase")]
    RawData { data: &'a [u8] },
    // #[serde(rename_all = "camelCase")]
    // Data {
    //     // Sled
    //     is_race_on: bool,
    //     timestamp_ms: u32, // Can overflow to 0 eventually
    //     engine_max_rpm: f32,
    //     engine_idle_rpm: f32,
    //     current_engine_rpm: f32,
    //     acceleration_x: f32, // In the car's local space; X = right, Y = up, Z = forward
    //     acceleration_y: f32,
    //     acceleration_z: f32,
    //     velocity_x: f32, // In the car's local space; X = right, Y = up, Z = forward
    //     velocity_y: f32,
    //     velocity_z: f32,
    //     angular_velocity_x: f32, // In the car's local space; X = pitch, Y = yaw, Z = roll
    //     angular_velocity_y: f32,
    //     angular_velocity_z: f32,
    //     yaw: f32,
    //     pitch: f32,
    //     roll: f32,
    //     normalized_suspension_travel_front_left: f32, // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
    //     normalized_suspension_travel_front_right: f32,
    //     normalized_suspension_travel_rear_left: f32,
    //     normalized_suspension_travel_rear_right: f32,
    //     tire_slip_ratio_front_left: f32, // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
    //     tire_slip_ratio_front_right: f32,
    //     tire_slip_ratio_rear_left: f32,
    //     tire_slip_ratio_rear_right: f32,
    //     wheel_rotation_speed_front_left: f32, // Wheel rotation speed radians/sec.
    //     wheel_rotation_speed_front_right: f32,
    //     wheel_rotation_speed_rear_left: f32,
    //     wheel_rotation_speed_rear_right: f32,
    //     wheel_on_rumble_strip_front_left: f32, // = 1 when wheel is on rumble strip, = 0 when off.
    //     wheel_on_rumble_strip_front_right: f32,
    //     wheel_on_rumble_strip_rear_left: f32,
    //     wheel_on_rumble_strip_rear_right: f32,
    //     wheel_in_puddle_depth_front_left: f32, // = from 0 to 1, where 1 is the deepest puddle
    //     wheel_in_puddle_depth_front_right: f32,
    //     wheel_in_puddle_depth_rear_left: f32,
    //     wheel_in_puddle_depth_rear_right: f32,
    //     surface_rumble_front_left: f32, // Non-dimensional surface rumble values passed to controller force feedback
    //     surface_rumble_front_right: f32,
    //     surface_rumble_rear_left: f32,
    //     surface_rumble_rear_right: f32,
    //     tire_slip_angle_front_left: f32, // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
    //     tire_slip_angle_front_right: f32,
    //     tire_slip_angle_rear_left: f32,
    //     tire_slip_angle_rear_right: f32,
    //     tire_combined_slip_front_left: f32, // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
    //     tire_combined_slip_front_right: f32,
    //     tire_combined_slip_rear_left: f32,
    //     tire_combined_slip_rear_right: f32,
    //     suspension_travel_meters_front_left: f32, // Actual suspension travel in meters
    //     suspension_travel_meters_front_right: f32,
    //     suspension_travel_meters_rear_left: f32,
    //     suspension_travel_meters_rear_right: f32,
    //     car_ordinal: i32,           // Unique ID of the car make/model
    //     car_class: i32, // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
    //     car_performance_index: i32, // Between 100 (slowest car) and 999 (fastest car) inclusive
    //     drivetrain_type: i32, // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
    //     num_cylinders: i32, // Number of cylinders in the engine

    //     // Dash
    //     position_x: f32,
    //     position_y: f32,
    //     position_z: f32,
    //     speed: f32,
    //     power: f32,
    //     torque: f32,
    //     tire_temp_fl: f32,
    //     tire_temp_fr: f32,
    //     tire_temp_rl: f32,
    //     tire_temp_rr: f32,
    //     boost: f32,
    //     fuel: f32,
    //     distance: f32,
    //     best_lap_time: f32,
    //     last_lap_time: f32,
    //     current_lap_time: f32,
    //     current_race_time: f32,
    //     lap: u16,
    //     race_position: u8,
    //     accelerator: u8,
    //     brake: u8,
    //     clutch: u8,
    //     handbrake: u8,
    //     gear: u8,
    //     steer: i8,
    //     normal_driving_line: i8,
    //     normal_ai_brake_difference: i8,
    // },
}

static END_SIGNAL: LazyLock<(
    Mutex<oneshot::Sender<u32>>,
    Mutex<futures::future::Shared<oneshot::Receiver<u32>>>,
)> = LazyLock::new(|| {
    let (tx, rx) = oneshot::channel();
    (Mutex::new(tx), Mutex::new(rx.shared()))
});

#[tauri::command]
async fn listen_data(
    app: AppHandle,
    url: String,
    forward: Option<String>,
    on_event: Channel<ListenEvent<'_>>, // warning: `Channel` not working in async, use `AppHandle` to send message
) {
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
            on_event
                .send(ListenEvent::Error {
                    reason: format!("Socket Open Failed ({:?})", e),
                })
                .unwrap();
            return;
        }
    };

    println!("Start listening {}", url);
    on_event.send(ListenEvent::Opened {}).unwrap();

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
                // `on_event` is buggy, tauri channel is not reliable at all!!!
                // use globe event to send data
                // if let Err(e) = on_event.send(to_data(&buf[..amt])) {
                //     println!("Channel Error ({:?})", e);
                // }
                // And the `Serialize` is also buggy, only u32 number can be transmitted.
                // Other number type will reset to 0 for no reason.
                // let data = to_data(&buf[..amt]);
                // println!("{:?}", &data);

                // parse in js, tauri is stupid!!!
                let data = ListenEvent::RawData { data: &buf[..amt] };
                app.emit("on-data", data).unwrap();
                if let Some(forward) = &forward {
                    if let Err(e) = socket.send_to(&buf[..amt], &forward).await {
                        on_event
                            .send(ListenEvent::MessageError {
                                reason: format!("Forward Failed ({:?})", e),
                            })
                            .unwrap();
                    }
                }
            }
            Err(e) => {
                on_event
                    .send(ListenEvent::Error {
                        reason: format!("Socket Recv Failed ({:?})", e),
                    })
                    .unwrap();
                break;
            }
        }
    }
    on_event.send(ListenEvent::Closed {}).unwrap();
    println!("Stop listening {}", url);
}

// fn to_data(bytes: &[u8]) -> ListenEvent {
//     let buffer_offset = match bytes.len() {
//         232 => {
//             return ListenEvent::MessageError {
//                 reason: "Unsupported Data (FM7 sled)".to_string(),
//             }
//         }
//         311 => 0,  // FM7 dash
//         324 => 12, // FH4
//         331 => 0,  // FM8 dash
//         _ => {
//             return ListenEvent::MessageError {
//                 reason: "Unsupported Data (Unknown)".to_string(),
//             }
//         }
//     };

//     // println!("{:x?}", &bytes[..32]);
//     // println!("{}", get_float32(bytes, 8));
//     return ListenEvent::Data {
//         is_race_on: get_int32(bytes, 0) > 0,
//         timestamp_ms: get_uint32(bytes, 4),
//         engine_max_rpm: get_float32(bytes, 8),
//         engine_idle_rpm: get_float32(bytes, 12),
//         current_engine_rpm: get_float32(bytes, 16),
//         acceleration_x: get_float32(bytes, 20),
//         acceleration_y: get_float32(bytes, 24),
//         acceleration_z: get_float32(bytes, 28),
//         velocity_x: get_float32(bytes, 32),
//         velocity_y: get_float32(bytes, 36),
//         velocity_z: get_float32(bytes, 40),
//         angular_velocity_x: get_float32(bytes, 44),
//         angular_velocity_y: get_float32(bytes, 48),
//         angular_velocity_z: get_float32(bytes, 52),
//         yaw: get_float32(bytes, 56),
//         pitch: get_float32(bytes, 60),
//         roll: get_float32(bytes, 64),
//         normalized_suspension_travel_front_left: get_float32(bytes, 68),
//         normalized_suspension_travel_front_right: get_float32(bytes, 72),
//         normalized_suspension_travel_rear_left: get_float32(bytes, 76),
//         normalized_suspension_travel_rear_right: get_float32(bytes, 80),
//         tire_slip_ratio_front_left: get_float32(bytes, 84),
//         tire_slip_ratio_front_right: get_float32(bytes, 88),
//         tire_slip_ratio_rear_left: get_float32(bytes, 92),
//         tire_slip_ratio_rear_right: get_float32(bytes, 96),
//         wheel_rotation_speed_front_left: get_float32(bytes, 100),
//         wheel_rotation_speed_front_right: get_float32(bytes, 104),
//         wheel_rotation_speed_rear_left: get_float32(bytes, 108),
//         wheel_rotation_speed_rear_right: get_float32(bytes, 112),
//         wheel_on_rumble_strip_front_left: get_float32(bytes, 116),
//         wheel_on_rumble_strip_front_right: get_float32(bytes, 120),
//         wheel_on_rumble_strip_rear_left: get_float32(bytes, 124),
//         wheel_on_rumble_strip_rear_right: get_float32(bytes, 128),
//         wheel_in_puddle_depth_front_left: get_float32(bytes, 132),
//         wheel_in_puddle_depth_front_right: get_float32(bytes, 136),
//         wheel_in_puddle_depth_rear_left: get_float32(bytes, 140),
//         wheel_in_puddle_depth_rear_right: get_float32(bytes, 144),
//         surface_rumble_front_left: get_float32(bytes, 148),
//         surface_rumble_front_right: get_float32(bytes, 152),
//         surface_rumble_rear_left: get_float32(bytes, 156),
//         surface_rumble_rear_right: get_float32(bytes, 160),
//         tire_slip_angle_front_left: get_float32(bytes, 164),
//         tire_slip_angle_front_right: get_float32(bytes, 168),
//         tire_slip_angle_rear_left: get_float32(bytes, 172),
//         tire_slip_angle_rear_right: get_float32(bytes, 176),
//         tire_combined_slip_front_left: get_float32(bytes, 180),
//         tire_combined_slip_front_right: get_float32(bytes, 184),
//         tire_combined_slip_rear_left: get_float32(bytes, 188),
//         tire_combined_slip_rear_right: get_float32(bytes, 192),
//         suspension_travel_meters_front_left: get_float32(bytes, 196),
//         suspension_travel_meters_front_right: get_float32(bytes, 200),
//         suspension_travel_meters_rear_left: get_float32(bytes, 204),
//         suspension_travel_meters_rear_right: get_float32(bytes, 208),
//         car_ordinal: get_int32(bytes, 212),
//         car_class: get_int32(bytes, 216),
//         car_performance_index: get_int32(bytes, 220),
//         drivetrain_type: get_int32(bytes, 224),
//         num_cylinders: get_int32(bytes, 228),
//         // Dash
//         position_x: get_float32(bytes, 232 + buffer_offset),
//         position_y: get_float32(bytes, 236 + buffer_offset),
//         position_z: get_float32(bytes, 240 + buffer_offset),
//         speed: get_float32(bytes, 244 + buffer_offset),
//         power: get_float32(bytes, 248 + buffer_offset),
//         torque: get_float32(bytes, 252 + buffer_offset),
//         tire_temp_fl: get_float32(bytes, 256 + buffer_offset),
//         tire_temp_fr: get_float32(bytes, 260 + buffer_offset),
//         tire_temp_rl: get_float32(bytes, 264 + buffer_offset),
//         tire_temp_rr: get_float32(bytes, 268 + buffer_offset),
//         boost: get_float32(bytes, 272 + buffer_offset),
//         fuel: get_float32(bytes, 276 + buffer_offset),
//         distance: get_float32(bytes, 280 + buffer_offset),
//         best_lap_time: get_float32(bytes, 284 + buffer_offset),
//         last_lap_time: get_float32(bytes, 288 + buffer_offset),
//         current_lap_time: get_float32(bytes, 292 + buffer_offset),
//         current_race_time: get_float32(bytes, 296 + buffer_offset),
//         lap: get_uint16(bytes, 300 + buffer_offset),
//         race_position: get_uint8(bytes, 302 + buffer_offset),
//         accelerator: get_uint8(bytes, 303 + buffer_offset),
//         brake: get_uint8(bytes, 304 + buffer_offset),
//         clutch: get_uint8(bytes, 305 + buffer_offset),
//         handbrake: get_uint8(bytes, 306 + buffer_offset),
//         gear: get_uint8(bytes, 307 + buffer_offset),
//         steer: get_int8(bytes, 308 + buffer_offset),
//         normal_driving_line: get_int8(bytes, 309 + buffer_offset),
//         normal_ai_brake_difference: get_int8(bytes, 310 + buffer_offset),
//     };
// }

// fn get_float32(bytes: &[u8], index: usize) -> f32 {
//     return f32::from_le_bytes([
//         bytes[index],
//         bytes[index + 1],
//         bytes[index + 2],
//         bytes[index + 3],
//     ]);
// }

// fn get_int32(bytes: &[u8], index: usize) -> i32 {
//     return i32::from_le_bytes([
//         bytes[index],
//         bytes[index + 1],
//         bytes[index + 2],
//         bytes[index + 3],
//     ]);
// }

// fn get_uint32(bytes: &[u8], index: usize) -> u32 {
//     return u32::from_le_bytes([
//         bytes[index],
//         bytes[index + 1],
//         bytes[index + 2],
//         bytes[index + 3],
//     ]);
// }
// fn get_uint16(bytes: &[u8], index: usize) -> u16 {
//     return u16::from_le_bytes([bytes[index], bytes[index + 1]]);
// }

// fn get_uint8(bytes: &[u8], index: usize) -> u8 {
//     return u8::from_le(bytes[index]);
// }

// fn get_int8(bytes: &[u8], index: usize) -> i8 {
//     return i8::from_le_bytes([bytes[index]]);
// }
