import React from "react";
import CircularBuffer from "./CircularBuffer";
import { MessageData, MessageDataAnalysis } from "./MessageData";
import { Page } from "./Page";
import { UnitSystem } from "./UnitConvert";

export type ListenAddress = [
    string/* address */,
    string/* port */,
    boolean/* forward switch */,
    string/* forward address */,
    string/* forward port */,
    number/* stamp, for manually renew socket on the same address:port */,
];

export enum SocketStats {
    opening = "Opening",
    opened = "Opened",
    error = "Error",
    closed = "Closed",
}

export enum AppWindowMode {
    Single,
    Multi,
};

export type WindowContext = {
    showEnginePowerCurve: boolean,
    setShowEnginePowerCurve: (v: boolean) => unknown,
    detailOption: string,
    setDetailOption: (v: string) => unknown,
    showDetailDelta: boolean,
    setShowDetailDelta: (v: boolean) => unknown,
};

export const ReactWindowContext = React.createContext(null as unknown as WindowContext);

export type AppContext = {
    openNetwork: () => unknown,
    openSettings: () => unknown,
    resetData: () => unknown,
    listenAddress: ListenAddress;
    setListenAddress: (v: ListenAddress) => unknown,
    enableDarkTheme: boolean | undefined,
    setEnableDarkTheme: (v: boolean | undefined) => unknown,
    unitSystem: UnitSystem,
    setUnitSystem: (v: UnitSystem) => unknown,
    dataBufferLength: number,
    setDataBufferLength: (v: number) => unknown,
    errorMessage: string[],
    setErrorMessage: (v: string[]) => unknown,
    socketStats: SocketStats,

    lastOpenedPage: Page,
    setLastOpenedPage: (v: Page) => unknown,
    appWindowMode: AppWindowMode,
    setAppWindowMode: (v: AppWindowMode) => unknown,
};

export const ReactAppContext = React.createContext(null as unknown as AppContext);

export type StreamAppContext = {
    messageData: CircularBuffer<MessageData>,
    messageDataAnalysis: MessageDataAnalysis,

    tick: unknown,
};

export const ReactStreamAppContext = React.createContext(null as unknown as StreamAppContext);
