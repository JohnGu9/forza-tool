import React from "react";

import CircularBuffer from "./CircularBuffer";
import { MessageData } from "./MessageData";
import { MessageDataAnalysis } from "./MessageDataAnalysis";
import { Page } from "./Page";
import { SocketState } from "./SocketState";
import { UnitSystem } from "./UnitConvert";

export type ListenAddress = {
    address: string;
    port: string;
    forwardSwitch: boolean;
    forwardAddress: string;
    forwardPort: string;
    stamp: number;  /* for manually renew socket on the same address:port */
};

export enum AppWindowMode {
    Single,
    Multi,
};

export enum WindowZIndex {
    None = "None",
    Top = "Top",
    Bottom = "Bottom",
};

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
    windowZIndex: WindowZIndex;
    setWindowZIndex: (v: WindowZIndex) => unknown,
    socketStats: SocketState,

    lastOpenedPage: Page,
    setLastOpenedPage: (v: Page) => unknown,
    appWindowMode: AppWindowMode,
    setAppWindowMode: (v: AppWindowMode) => unknown,
};

export const ReactAppContext = React.createContext(null as unknown as AppContext);

export type StreamAppContext = {
    messageData: CircularBuffer<MessageData>,
    messageDataAnalysis: MessageDataAnalysis,
    isPaused: boolean,

    tick: unknown,
};

export const ReactStreamAppContext = React.createContext(null as unknown as StreamAppContext);
