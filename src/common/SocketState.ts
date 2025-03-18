export enum SocketState {
    opening = "Opening",
    opened = "Opened",
    error = "Error",
    closed = "Closed",
}

export function socketStateToIcon(socketStats: SocketState) {
    switch (socketStats) {
        case SocketState.opening:
            return "settings_input_antenna";
        case SocketState.opened:
            return "wifi_tethering";
        case SocketState.error:
            return "error";
        case SocketState.closed:
            return "warning";
    }
}

export function isSocketError(socketStats: SocketState) {
    switch (socketStats) {
        case SocketState.opening:
        case SocketState.opened:
            return false;
        case SocketState.error:
        case SocketState.closed:
            return true;
    }
}
