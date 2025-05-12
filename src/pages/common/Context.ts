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
    Rotation = "rotation",
    Position = "position",
}

export enum SpeedMeterOption {
    VelocityVsSpeed,
    VelocityVsVelocityPrediction,
    VelocityPredictionVsSpeed,
};

export enum TimeCalibration {
    X1 = 1,
    X10 = 10,
    X100 = 100,
    X1000 = 1000,
    X10000 = 10000,
};

export type WindowContext = {
    padding: string,
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
    timeCalibration: TimeCalibration,
    setTimeCalibration: (v: TimeCalibration) => unknown,
};

export const ReactWindowContext = React.createContext(undefined as unknown as WindowContext);

export function useWindowContext(padding: string) {
    const [showEnginePowerCurve, setShowEnginePowerCurve] = React.useState(true);
    const [tireOption, setTireOption] = React.useState(TireOption.SlipAngle);
    const [motionOption, setMotionOption] = React.useState(MotionOption.Acceleration);
    const [speedMeterOption, setSpeedMeterOption] = React.useState(SpeedMeterOption.VelocityVsSpeed);
    const [detailOption, setDetailOption] = React.useState<MessageDataKey>("timestampMs");
    const [showDetailDelta, setShowDetailDelta] = React.useState(false);
    const [timeCalibration, setTimeCalibration] = React.useState(TimeCalibration.X1);
    const windowContext = React.useMemo<WindowContext>(() => {
        return {
            padding,
            tireOption, setTireOption,
            motionOption, setMotionOption,
            speedMeterOption, setSpeedMeterOption,
            showEnginePowerCurve, setShowEnginePowerCurve,
            detailOption, setDetailOption,
            showDetailDelta, setShowDetailDelta,
            timeCalibration, setTimeCalibration,
        };
    }, [detailOption, motionOption, padding, showDetailDelta, showEnginePowerCurve, speedMeterOption, timeCalibration, tireOption]);
    return windowContext;
}
