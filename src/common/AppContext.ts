import React from "react";
import CircularBuffer from "./CircularBuffer";
import { MessageData, MessageDataAnalysis } from "./MessageData";

export type ListenAddress = [string, string, number];

export enum UnitSystem {
    International,
    Imperial,
};

export type AppContext = {
    listenAddress: ListenAddress;
    setListenAddress: (value: ListenAddress) => unknown,
    enableDarkTheme: boolean | undefined,
    setEnableDarkTheme: (v: boolean | undefined) => unknown,
    unitSystem: UnitSystem,
    setUnitSystem: (v: UnitSystem) => unknown,

};

export const ReactAppContext = React.createContext(null as unknown as AppContext);

export type StreamAppContext = {
    messageData: CircularBuffer<MessageData>,
    messageDataAnalysis: MessageDataAnalysis,

    tick: unknown,
};

export const ReactStreamAppContext = React.createContext(null as unknown as StreamAppContext);
