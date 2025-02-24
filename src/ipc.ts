// When using the Tauri API npm package:
import { invoke, Channel } from '@tauri-apps/api/core';

export type CallableCmd = "my_custom_command";

export type ListenableEvent = "listen_data";

export async function log(message: string) {
    await invoke("my_custom_command", { message });
}

async function listen<T>(cmd: ListenableEvent, args: Omit<Record<string, unknown>, "onEvent">, onmessage: (response: T) => void) {
    const onEvent = new Channel<T>();
    onEvent.onmessage = onmessage;
    await invoke(cmd, { ...args, onEvent });
    return onEvent;
}

export type ListenDataEvent =
    | {
        event: 'error';
        data: { reason: string; };
    }
    | {
        event: 'messageError';
        data: { reason: string; };
    }
    | {
        event: 'opened';
        data: unknown;
    }
    | {
        event: 'closed';
        data: unknown;
    }
    | {
        event: 'raw_data';
        data: number[];
    };

export async function listenData(url: string, forward: string | null, onMessage: (event: ListenDataEvent) => unknown) {
    return await listen<ListenDataEvent>("listen_data", { url, forward }, onMessage);
}
