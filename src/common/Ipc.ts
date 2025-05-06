// When using the Tauri API npm package:
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export async function log(message: string) {
    await invoke("my_custom_command", { message });
}

export type ListenDataEvent =
    | {
        event: "error";
        data: { id: number; reason: string; };
    }
    | {
        event: "messageError";
        data: { id: number; reason: string; };
    }
    | {
        event: "opened";
        data: { id: number; };
    }
    | {
        event: "closed";
        data: { id: number; };
    }
    | {
        event: "rawData";
        data: { id: number; data: number[]; };
    };

let id = 0;
export async function listenData(url: string, forward: string | null, onMessage: (event: ListenDataEvent) => unknown) {
    const thisId = id;
    id++;
    const unmount = await listen<ListenDataEvent>("on-data", event => {
        if (event.payload.data.id === thisId) {
            onMessage(event.payload);
        }
    });
    await invoke("listen_data", { id: thisId, url, forward });
    return unmount;
}
