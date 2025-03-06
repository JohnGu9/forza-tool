import { SocketStats } from "./AppContext";

export default function socketStatsToIcon(socketStats: SocketStats) {
    switch (socketStats) {
        case SocketStats.opening:
            return "settings_input_antenna";
        case SocketStats.opened:
            return "wifi_tethering";
        case SocketStats.error:
            return "error";
        case SocketStats.closed:
            return "warning";
    }
}
