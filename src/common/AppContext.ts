import React from "react";
import CircularBuffer from "./CircularBuffer";
import { MessageData, MessageDataAnalysis } from "./MessageData";

export type ListenAddress = [
    string/* address */,
    string/* port */,
    boolean/* forward switch */,
    string/* forward address */,
    string/* forward port */,
    number/* stamp, for manually renew socket on the same address:port */,
];

export enum UnitSystem {
    International,
    Imperial,
};

export type AppContext = {
    resetData: () => unknown,
    listenAddress: ListenAddress;
    setListenAddress: (value: ListenAddress) => unknown,
    enableDarkTheme: boolean | undefined,
    setEnableDarkTheme: (v: boolean | undefined) => unknown,
    unitSystem: UnitSystem,
    setUnitSystem: (v: UnitSystem) => unknown,
    dataBufferLength: number,
    setDataBufferLength: (v: number) => unknown,
};

export const ReactAppContext = React.createContext(null as unknown as AppContext);

export type StreamAppContext = {
    messageData: CircularBuffer<MessageData>,
    messageDataAnalysis: MessageDataAnalysis,

    tick: unknown,
};

export const ReactStreamAppContext = React.createContext(null as unknown as StreamAppContext);
