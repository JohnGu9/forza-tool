import React from "react";
import { Page } from "../common/Page";
import Control from "./Control";
import Detail from "./Detail";
import Engine from "./Engine";
import SpeedMeter from "./SpeedMeter";
import Tachometer from "./Tachometer";
import Tire from "./TIre";

export default function getPage(page: Page) {
    switch (page) {
        case Page.Engine:
            return <Engine />;
        case Page.Tire:
            return <Tire />;
        case Page.Tachometer:
            return <Tachometer />;
        case Page.Detail:
            return <Detail />;
        case Page.SpeedMeter:
            return <SpeedMeter />;
        case Page.Control:
            return <Control />;
    }
}

export type MultiPageAppContext = {
    usedPages: Set<Page>,
};

export const ReactMultiPageAppContext = React.createContext(undefined as unknown as MultiPageAppContext);
