import React from "react";

import { MessageDataKey } from "../../common/MessageData";

export enum TireOption {
    SlipAngle = "tireSlipAngle",
    SlipRatio = "tireSlipRatio",
    CombinedSlip = "tireCombinedSlip",
    Temp = "tireTemp",
    SurfaceRumble = "surfaceRumble",
    WheelRotationSpeed = "wheelRotationSpeed",
    WheelOnRumbleStrip = "wheelOnRumbleStrip",
    WheelInPuddleDepth = "wheelInPuddleDepth",
    NormalizedSuspensionTravel = "normalizedSuspensionTravel",
    SuspensionTravelMeters = "suspensionTravelMeters",
    TireWear = "tireWear",
}

export enum MotionOption {
    Acceleration = "acceleration",
    Velocity = "velocity",
    AngularVelocity = "angularVelocity",
    AngularVelocityGlobal = "angularVelocityGlobal",
    Position = "position",
}

export enum SpeedMeterOption {
    VelocityVsSpeed,
    VelocityVsVelocityPrediction,
    VelocityPredictionVsSpeed,
};

export type PageContext = {
    showEnginePowerCurve: boolean,
    setShowEnginePowerCurve: (v: boolean) => unknown,
    tireOption: TireOption,
    setTireOption: (v: TireOption) => unknown,
    motionOption: MotionOption,
    setMotionOption: (v: MotionOption) => unknown,
    speedMeterOption: SpeedMeterOption,
    setSpeedMeterOption: (v: SpeedMeterOption) => unknown,
    detailOption: MessageDataKey,
    setDetailOption: (v: MessageDataKey) => unknown,
    showDetailDelta: boolean,
    setShowDetailDelta: (v: boolean) => unknown,
};

export const ReactPageContext = React.createContext(null as unknown as PageContext);
