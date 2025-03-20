import CircularBuffer from "./CircularBuffer";
import quickSearch from "./QuickSearch";

export enum DataType {
    Sled,
    FH4Dash,
    FM7Dash,
    FM8Dash,
};

export type MessageData = {
    dataType: DataType,

    // Sled
    isRaceOn: number,   // = 1 when race is on. = 0 when in menus/race stopped
    timestampMs: number, // Can overflow to 0 eventually
    engineMaxRpm: number,
    engineIdleRpm: number,
    currentEngineRpm: number,
    accelerationX: number, // In the car's local space; X = right, Y = up, Z = forward
    accelerationY: number,
    accelerationZ: number,
    velocityX: number, // In the car's local space; X = right, Y = up, Z = forward
    velocityY: number,
    velocityZ: number,
    angularVelocityX: number, // In the car's local space; X = pitch, Y = yaw, Z = roll
    angularVelocityY: number,
    angularVelocityZ: number,
    yaw: number,
    pitch: number,
    roll: number,
    normalizedSuspensionTravelFrontLeft: number, // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
    normalizedSuspensionTravelFrontRight: number,
    normalizedSuspensionTravelRearLeft: number,
    normalizedSuspensionTravelRearRight: number,
    tireSlipRatioFrontLeft: number, // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
    tireSlipRatioFrontRight: number,
    tireSlipRatioRearLeft: number,
    tireSlipRatioRearRight: number,
    wheelRotationSpeedFrontLeft: number, // Wheel rotation speed radians/sec.
    wheelRotationSpeedFrontRight: number,
    wheelRotationSpeedRearLeft: number,
    wheelRotationSpeedRearRight: number,
    wheelOnRumbleStripFrontLeft: number, // = 1 when wheel is on rumble strip, = 0 when off.
    wheelOnRumbleStripFrontRight: number,
    wheelOnRumbleStripRearLeft: number,
    wheelOnRumbleStripRearRight: number,
    wheelInPuddleDepthFrontLeft: number, // = from 0 to 1, where 1 is the deepest puddle
    wheelInPuddleDepthFrontRight: number,
    wheelInPuddleDepthRearLeft: number,
    wheelInPuddleDepthRearRight: number,
    surfaceRumbleFrontLeft: number, // Non-dimensional surface rumble values passed to controller force feedback
    surfaceRumbleFrontRight: number,
    surfaceRumbleRearLeft: number,
    surfaceRumbleRearRight: number,
    tireSlipAngleFrontLeft: number, // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
    tireSlipAngleFrontRight: number,
    tireSlipAngleRearLeft: number,
    tireSlipAngleRearRight: number,
    tireCombinedSlipFrontLeft: number, // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
    tireCombinedSlipFrontRight: number,
    tireCombinedSlipRearLeft: number,
    tireCombinedSlipRearRight: number,
    suspensionTravelMetersFrontLeft: number, // Actual suspension travel in meters
    suspensionTravelMetersFrontRight: number,
    suspensionTravelMetersRearLeft: number,
    suspensionTravelMetersRearRight: number,
    carOrdinal: number,           // Unique ID of the car make/model
    carClass: number, // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
    carPerformanceIndex: number, // Between 100 (slowest car) and 999 (fastest car) inclusive
    drivetrainType: number, // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
    numCylinders: number, // Number of cylinders in the engine

    // Dash
    positionX: number,
    positionY: number,
    positionZ: number,
    speed: number,
    power: number,
    torque: number,
    tireTempFrontLeft: number,
    tireTempFrontRight: number,
    tireTempRearLeft: number,
    tireTempRearRight: number,
    boost: number,
    fuel: number,
    distance: number,
    bestLapTime: number,
    lastLapTime: number,
    currentLapTime: number,
    currentRaceTime: number,
    lap: number,
    racePosition: number,
    accelerator: number,
    brake: number,
    clutch: number,
    handbrake: number,
    gear: number,
    steer: number,
    normalDrivingLine: number,
    normalAiBrakeDifference: number,

    // FM8 extend
    tireWearFrontLeft: number;
    tireWearFrontRight: number;
    tireWearRearLeft: number;
    tireWearRearRight: number;
    trackOrdinal: number;
};

function getBufferOffset(dataType: DataType) {
    switch (dataType) {
        case DataType.FH4Dash:
            return 12;
    }
    return 0;
}

export function parseMessageData(buffer: number[]): MessageData {
    let dataType = DataType.Sled;
    switch (buffer.length) {
        case 232: // Sled
            dataType = DataType.Sled;
            break;
        case 324:// FH4
            dataType = DataType.FH4Dash;
            break;
        case 311:// FM7 dash
            dataType = DataType.FM7Dash;
            break;
        case 331:// FM8 dash
            dataType = DataType.FM8Dash;
            break;
        default:
            throw Error(`Unsupported Data (Unknown length: ${buffer.length})`);
    }
    const buffer_offset = getBufferOffset(dataType);


    const array = new Uint8Array(buffer);
    const bytes = new DataView(array.buffer);

    function get_float32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getFloat32(index, true);
    }

    function get_int32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getInt32(index, true);
    }

    function get_uint32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint32(index, true);
    }

    function get_uint16(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint16(index, true);
    }

    function get_uint8(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint8(index);
    }

    function get_int8(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getInt8(index);
    }

    function getSled() {
        return {
            isRaceOn: get_int32(bytes, 0),
            timestampMs: get_uint32(bytes, 4), // Can overflow to 0 eventually
            engineMaxRpm: get_float32(bytes, 8),
            engineIdleRpm: get_float32(bytes, 12),
            currentEngineRpm: get_float32(bytes, 16),
            accelerationX: get_float32(bytes, 20), // In the car's local space; X = right, Y = up, Z = forward
            accelerationY: get_float32(bytes, 24),
            accelerationZ: get_float32(bytes, 28),
            velocityX: get_float32(bytes, 32), // In the car's local space; X = right, Y = up, Z = forward
            velocityY: get_float32(bytes, 36),
            velocityZ: get_float32(bytes, 40),
            angularVelocityX: get_float32(bytes, 44), // In the car's local space; X = pitch, Y = yaw, Z = roll
            angularVelocityY: get_float32(bytes, 48),
            angularVelocityZ: get_float32(bytes, 52),
            yaw: get_float32(bytes, 56),
            pitch: get_float32(bytes, 60),
            roll: get_float32(bytes, 64),
            normalizedSuspensionTravelFrontLeft: get_float32(bytes, 68), // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
            normalizedSuspensionTravelFrontRight: get_float32(bytes, 72),
            normalizedSuspensionTravelRearLeft: get_float32(bytes, 76),
            normalizedSuspensionTravelRearRight: get_float32(bytes, 80),
            tireSlipRatioFrontLeft: get_float32(bytes, 84), // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
            tireSlipRatioFrontRight: get_float32(bytes, 88),
            tireSlipRatioRearLeft: get_float32(bytes, 92),
            tireSlipRatioRearRight: get_float32(bytes, 96),
            wheelRotationSpeedFrontLeft: get_float32(bytes, 100), // Wheel rotation speed radians/sec.
            wheelRotationSpeedFrontRight: get_float32(bytes, 104),
            wheelRotationSpeedRearLeft: get_float32(bytes, 108),
            wheelRotationSpeedRearRight: get_float32(bytes, 112),
            wheelOnRumbleStripFrontLeft: get_float32(bytes, 116), // = 1 when wheel is on rumble strip, = 0 when off.
            wheelOnRumbleStripFrontRight: get_float32(bytes, 120),
            wheelOnRumbleStripRearLeft: get_float32(bytes, 124),
            wheelOnRumbleStripRearRight: get_float32(bytes, 128),
            wheelInPuddleDepthFrontLeft: get_float32(bytes, 132), // = from 0 to 1, where 1 is the deepest puddle
            wheelInPuddleDepthFrontRight: get_float32(bytes, 136),
            wheelInPuddleDepthRearLeft: get_float32(bytes, 140),
            wheelInPuddleDepthRearRight: get_float32(bytes, 144),
            surfaceRumbleFrontLeft: get_float32(bytes, 148), // Non-dimensional surface rumble values passed to controller force feedback
            surfaceRumbleFrontRight: get_float32(bytes, 152),
            surfaceRumbleRearLeft: get_float32(bytes, 156),
            surfaceRumbleRearRight: get_float32(bytes, 160),
            tireSlipAngleFrontLeft: get_float32(bytes, 164), // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
            tireSlipAngleFrontRight: get_float32(bytes, 168),
            tireSlipAngleRearLeft: get_float32(bytes, 172),
            tireSlipAngleRearRight: get_float32(bytes, 176),
            tireCombinedSlipFrontLeft: get_float32(bytes, 180), // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
            tireCombinedSlipFrontRight: get_float32(bytes, 184),
            tireCombinedSlipRearLeft: get_float32(bytes, 188),
            tireCombinedSlipRearRight: get_float32(bytes, 192),
            suspensionTravelMetersFrontLeft: get_float32(bytes, 196), // Actual suspension travel in meters
            suspensionTravelMetersFrontRight: get_float32(bytes, 200),
            suspensionTravelMetersRearLeft: get_float32(bytes, 204),
            suspensionTravelMetersRearRight: get_float32(bytes, 208),
            carOrdinal: get_int32(bytes, 212),           // Unique ID of the car make/model
            carClass: get_int32(bytes, 216), // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
            carPerformanceIndex: get_int32(bytes, 220), // Between 100 (slowest car) and 999 (fastest car) inclusive
            drivetrainType: get_int32(bytes, 224), // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
            numCylinders: get_int32(bytes, 228), // Number of cylinders in the engine
        };
    }

    function getDash() {
        switch (dataType) {
            case DataType.FH4Dash:
            case DataType.FM7Dash:
            case DataType.FM8Dash:
                return {
                    positionX: get_float32(bytes, 232 + buffer_offset),
                    positionY: get_float32(bytes, 236 + buffer_offset),
                    positionZ: get_float32(bytes, 240 + buffer_offset),
                    speed: get_float32(bytes, 244 + buffer_offset),
                    power: get_float32(bytes, 248 + buffer_offset),
                    torque: get_float32(bytes, 252 + buffer_offset),
                    tireTempFrontLeft: get_float32(bytes, 256 + buffer_offset),
                    tireTempFrontRight: get_float32(bytes, 260 + buffer_offset),
                    tireTempRearLeft: get_float32(bytes, 264 + buffer_offset),
                    tireTempRearRight: get_float32(bytes, 268 + buffer_offset),
                    boost: get_float32(bytes, 272 + buffer_offset),
                    fuel: get_float32(bytes, 276 + buffer_offset),
                    distance: get_float32(bytes, 280 + buffer_offset),
                    bestLapTime: get_float32(bytes, 284 + buffer_offset),
                    lastLapTime: get_float32(bytes, 288 + buffer_offset),
                    currentLapTime: get_float32(bytes, 292 + buffer_offset),
                    currentRaceTime: get_float32(bytes, 296 + buffer_offset),
                    lap: get_uint16(bytes, 300 + buffer_offset),
                    racePosition: get_uint8(bytes, 302 + buffer_offset),
                    accelerator: get_uint8(bytes, 303 + buffer_offset),
                    brake: get_uint8(bytes, 304 + buffer_offset),
                    clutch: get_uint8(bytes, 305 + buffer_offset),
                    handbrake: get_uint8(bytes, 306 + buffer_offset),
                    gear: get_uint8(bytes, 307 + buffer_offset),
                    steer: get_int8(bytes, 308 + buffer_offset),
                    normalDrivingLine: get_int8(bytes, 309 + buffer_offset),
                    normalAiBrakeDifference: get_int8(bytes, 310 + buffer_offset),
                };
        }
        return {
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            speed: 0,
            power: 0,
            torque: 0,
            tireTempFrontLeft: 0,
            tireTempFrontRight: 0,
            tireTempRearLeft: 0,
            tireTempRearRight: 0,
            boost: 0,
            fuel: 0,
            distance: 0,
            bestLapTime: 0,
            lastLapTime: 0,
            currentLapTime: 0,
            currentRaceTime: 0,
            lap: 0,
            racePosition: 0,
            accelerator: 0,
            brake: 0,
            clutch: 0,
            handbrake: 0,
            gear: 0,
            steer: 0,
            normalDrivingLine: 0,
            normalAiBrakeDifference: 0,
        };
    }

    function getFm8Extend() {
        switch (dataType) {
            case DataType.FM8Dash:
                return {
                    tireWearFrontLeft: get_float32(bytes, 311 + buffer_offset),
                    tireWearFrontRight: get_float32(bytes, 315 + buffer_offset),
                    tireWearRearLeft: get_float32(bytes, 319 + buffer_offset),
                    tireWearRearRight: get_float32(bytes, 323 + buffer_offset),
                    trackOrdinal: get_int32(bytes, 327 + buffer_offset),
                };
        }
        return {
            tireWearFrontLeft: 0,
            tireWearFrontRight: 0,
            tireWearRearLeft: 0,
            tireWearRearRight: 0,
            trackOrdinal: 0,
        };
    }

    return {
        dataType,
        ...getSled(),
        ...getDash(),
        ...getFm8Extend(),
    };
}

export type MessageDataAnalysis = {
    id: number,
    maxPower: { value: number, rpm: number, torque: number; };
    powerCurve: { rpm: number, power: number, torque: number; isFullAcceleratorForAWhile: boolean; }[];
    distance: CircularBuffer<number>;
    speed: CircularBuffer<number>;
    isFullAcceleratorForAWhile: boolean;
    stamp: number;
};

export function newMessageDataAnalysis(capacity: number): MessageDataAnalysis {
    return { id: 0, maxPower: { value: 0, rpm: 0, torque: 0 }, powerCurve: [], distance: new CircularBuffer<number>(capacity), speed: new CircularBuffer<number>(capacity), isFullAcceleratorForAWhile: false, stamp: 0 };
}

export function resetMessageDataAnalysis(analysis: MessageDataAnalysis) {
    analysis.id += 1;
    analysis.maxPower = { value: 0, rpm: 0, torque: 0 };
    analysis.powerCurve = [];
    analysis.distance = new CircularBuffer(analysis.distance.getCapacity());
    analysis.speed = new CircularBuffer(analysis.speed.getCapacity());
    analysis.isFullAcceleratorForAWhile = false;
    analysis.stamp = 0;
}

export function analyzeMessageData(messageData: CircularBuffer<MessageData>/* not empty ensure */, analysis: MessageDataAnalysis) {
    let changed = false;
    const lastData = messageData.slice(-6);
    const lastMessageData = lastData[lastData.length - 1];
    const isFullAcceleratorForAWhile = lastData.every(v => v.accelerator > 248 && v.gear === lastData[0].gear);

    if (validData(analysis, lastMessageData, isFullAcceleratorForAWhile)) {
        changed = true;
    }

    if (messageData.getElementCount() > 1) {
        analysis.distance.push(getDistance(lastData[lastData.length - 1], lastData[lastData.length - 2]));

        const timeDelta = lastData[lastData.length - 1].timestampMs - lastData[0].timestampMs;
        analysis.speed.push(positionToVelocity(analysis.distance.slice(-lastData.length), timeDelta / 1000));
        changed = true;
    } else {
        analysis.distance.push(0);
    }

    if (analysis.isFullAcceleratorForAWhile !== isFullAcceleratorForAWhile) {
        analysis.isFullAcceleratorForAWhile = isFullAcceleratorForAWhile;
        changed = true;
    }

    if (changed) {
        analysis.stamp += 1;
    }
}

const MaxFdTolerationFactor = 8;
const MinFdTolerationFactor = 2 / 3;
function validData(analysis: MessageDataAnalysis, lastMessageData: MessageData, isFullAcceleratorForAWhile: boolean) {
    if (lastMessageData.power <= 0 ||
        lastMessageData.currentEngineRpm === lastMessageData.engineMaxRpm ||
        lastMessageData.currentEngineRpm === lastMessageData.engineIdleRpm) {
        return false;
    }
    type Element = { power: number, rpm: number, torque: number; isFullAcceleratorForAWhile: boolean; };

    const powerCurveData = { power: lastMessageData.power, torque: lastMessageData.torque, rpm: lastMessageData.currentEngineRpm, isFullAcceleratorForAWhile };
    function updateMaxPower() {
        analysis.maxPower = { value: powerCurveData.power, torque: powerCurveData.torque, rpm: powerCurveData.rpm };
    }

    const rpmKey = powerCurveData.rpm.toFixed(1);
    function isSameRpm(rpm: number) {
        return rpm.toFixed(1) === rpmKey;
    }
    function isMaxPowerData(data: Element) {
        return data.rpm.toFixed(1) === analysis.maxPower.rpm.toFixed(1);
    }

    if (analysis.powerCurve.length === 0) {
        updateMaxPower();
        analysis.powerCurve = [powerCurveData];
        return true;
    }
    const isMaxPower = powerCurveData.power > 0 && analysis.maxPower.value < powerCurveData.power;
    const rpmArray = analysis.powerCurve.map(v => v.rpm);
    const insertIndex = quickSearch(rpmArray, powerCurveData.rpm);

    // fd means First Derivative
    function getFirstDerivative(first: { power: number, rpm: number; }, second: { power: number, rpm: number; }) {
        return (second.power - first.power) / (second.rpm - first.rpm);
    }

    if (insertIndex === 0) {
        const data = analysis.powerCurve[0];

        const fd1 = getFirstDerivative(powerCurveData, data);
        if (isMaxPower) {
            const minFdToleration = MinFdTolerationFactor * getFirstDerivative(powerCurveData, { power: 0, rpm: lastMessageData.engineMaxRpm });
            if (fd1 < minFdToleration) { // analysis.powerCurve[0] is invalid
                analysis.powerCurve[0] = powerCurveData;
            } else if (isSameRpm(data.rpm)) {
                analysis.powerCurve[0] = powerCurveData;
            } else {
                analysis.powerCurve = [powerCurveData, ...analysis.powerCurve];
            }
            updateMaxPower();
            return true;
        } else { // not max power
            if (fd1 <= 0) { // analysis.powerCurve[0] is invalid
                analysis.powerCurve[0] = powerCurveData;
                return true;
            }
            const maxFdToleration = MaxFdTolerationFactor * getFirstDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, { power: analysis.maxPower.value, rpm: analysis.maxPower.rpm });
            if (fd1 > maxFdToleration) {
                return false;
            }

            if (isSameRpm(data.rpm)) {
                if (isMaxPowerData(data)) {
                    return false;
                }
                analysis.powerCurve[0] = powerCurveData;
            } else {
                analysis.powerCurve = [powerCurveData, ...analysis.powerCurve];
            }
            return true;
        }
    } else if (insertIndex === rpmArray.length) {
        const lastIndex = analysis.powerCurve.length - 1;
        const data = analysis.powerCurve[lastIndex];

        if (powerCurveData.rpm === data.rpm) {
            powerCurveData.rpm = Math.min(powerCurveData.rpm + Number.MIN_VALUE, lastMessageData.engineMaxRpm);
        }
        const fd0 = getFirstDerivative(data, powerCurveData);
        if (isMaxPower) {
            const maxFdToleration = MaxFdTolerationFactor * getFirstDerivative({ rpm: lastMessageData.engineIdleRpm, power: 0 }, powerCurveData);
            if (fd0 > maxFdToleration) { // analysis.powerCurve[lastIndex] is invalid
                analysis.powerCurve[lastIndex] = powerCurveData;
            } else if (isSameRpm(data.rpm)) {
                analysis.powerCurve[lastIndex] = powerCurveData;
            } else {
                analysis.powerCurve.push(powerCurveData);
            }
            updateMaxPower();
            return true;
        } else { // not max power
            if (fd0 >= 0) { // analysis.powerCurve[lastIndex] is invalid
                analysis.powerCurve[lastIndex] = powerCurveData;
                return true;
            }
            const minFdToleration = MinFdTolerationFactor * getFirstDerivative({ power: analysis.maxPower.value, rpm: analysis.maxPower.rpm }, { power: 0, rpm: lastMessageData.engineMaxRpm });
            if (fd0 < minFdToleration) {
                return false;
            }

            if (isSameRpm(data.rpm)) {
                if (isMaxPowerData(data)) {
                    return false;
                }
                analysis.powerCurve[lastIndex] = powerCurveData;
            } else {
                analysis.powerCurve.push(powerCurveData);
            }
            return true;
        }
    }

    const data0 = analysis.powerCurve[insertIndex - 1];
    const data1 = analysis.powerCurve[insertIndex];

    const originFd = getFirstDerivative(data0, data1);
    const fd1 = getFirstDerivative(powerCurveData, data1);

    if (data0.rpm === powerCurveData.rpm) {
        powerCurveData.rpm += Number.MIN_VALUE;
    }

    const fd0 = getFirstDerivative(data0, powerCurveData);
    if (isMaxPower) {
        if ((insertIndex - 2) >= 0 && (insertIndex + 1) <= (analysis.powerCurve.length - 1)) {
            const data00 = analysis.powerCurve[insertIndex - 2];
            const data11 = analysis.powerCurve[insertIndex + 1];
            const originFd0 = getFirstDerivative(data00, data0);
            const originFd1 = getFirstDerivative(data1, data11);
            if (originFd0 < 0 && originFd1 < 0 && originFd < 0 && fd0 > 0) {
                return false;
            }
            if (originFd0 > 0 && originFd1 > 0 && originFd > 0 && fd1 < 0) {
                return false;
            }
        }
        const maxFdToleration = MaxFdTolerationFactor * getFirstDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, powerCurveData);
        const minFdToleration = MinFdTolerationFactor * getFirstDerivative(powerCurveData, { power: 0, rpm: lastMessageData.engineMaxRpm });

        const isData0Invalid = fd0 > maxFdToleration;
        const isData1Invalid = fd1 < minFdToleration;
        function merge(before: Element | undefined, target: Element, after: Element | undefined) {
            const res: Element[] = [];
            if (before !== undefined && !isSameRpm(before.rpm)) {
                res.push(before);
            }
            res.push(target);
            if (after !== undefined && !isSameRpm(after.rpm)) {
                res.push(after);
            }
            return res;
        }
        const m = merge(isData0Invalid ? undefined : data0, powerCurveData, isData1Invalid ? undefined : data1);

        analysis.powerCurve = [...analysis.powerCurve.slice(0, insertIndex - 1), ...m, ...analysis.powerCurve.slice(insertIndex + 1)];
        updateMaxPower();
        return true;
    } else {
        const maxFdToleration = MaxFdTolerationFactor * getFirstDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, { power: analysis.maxPower.value, rpm: analysis.maxPower.rpm });
        const minFdToleration = MinFdTolerationFactor * getFirstDerivative({ power: analysis.maxPower.value, rpm: analysis.maxPower.rpm }, { power: 0, rpm: lastMessageData.engineMaxRpm });
        function merge(before: Element | undefined, target: Element, after: Element | undefined) {
            let isBeforeInvalid = false;
            let isAfterInvalid = false;
            let isTargetInvalid = false;
            if (before !== undefined && isSameRpm(before.rpm)) {
                if (before.power < target.power) {
                    isBeforeInvalid = true;
                } else {
                    isTargetInvalid = false;
                }
            }
            if (after !== undefined && isSameRpm(after.rpm)) {
                if (after.power < target.power) {
                    isAfterInvalid = true;
                } else {
                    isTargetInvalid = false;
                }
            }

            const res: Element[] = [];
            if (before !== undefined && !isBeforeInvalid) {
                res.push(before);
            }
            if (!isTargetInvalid) {
                res.push(target);
            }
            if (after !== undefined && !isAfterInvalid) {
                res.push(after);
            }
            return res;
        }
        if (powerCurveData.rpm < analysis.maxPower.rpm) {
            if (fd0 <= 0 || fd1 > maxFdToleration) {
                return false;
            }
            const isData0Invalid = fd0 <= 0 || fd0 > maxFdToleration;
            const isData1Invalid = fd1 <= 0;
            const m = merge(isData0Invalid ? undefined : data0, powerCurveData, isData1Invalid ? undefined : data1);
            analysis.powerCurve = [...analysis.powerCurve.slice(0, insertIndex - 1), ...m, ...analysis.powerCurve.slice(insertIndex + 1)];
            return true;
        } else {
            if (fd1 >= 0 || fd0 < minFdToleration) {
                return false;
            }
            const isData0Invalid = fd0 >= 0;
            const isData1Invalid = fd1 >= 0 || fd1 < minFdToleration;
            const m = merge(isData0Invalid ? undefined : data0, powerCurveData, isData1Invalid ? undefined : data1);
            analysis.powerCurve = [...analysis.powerCurve.slice(0, insertIndex - 1), ...m, ...analysis.powerCurve.slice(insertIndex + 1)];
            return true;
        }
    }

}

type Position = {
    positionX: number,
    positionY: number,
    positionZ: number,
};// unit: m
function positionToVelocity(distances: number[], timeDelta: number /* unit: s */) {
    if (timeDelta <= 0) { return 0; }
    const distance = distances.reduce((sum, value) => sum += value, 0);
    return distance / timeDelta; // unit: m/s
}
function getDistance(now: Position, before: Position) {
    const distanceSquare = Math.pow(now.positionX - before.positionX, 2) +
        Math.pow(now.positionY - before.positionY, 2) +
        Math.pow(now.positionZ - before.positionZ, 2);
    return Math.pow(distanceSquare, 1 / 3);
}

export const dummyMessageData: MessageData = {
    dataType: DataType.Sled,
    // Sled
    isRaceOn: 0,
    timestampMs: 0, // Can overflow to 0 eventually
    engineMaxRpm: 0,
    engineIdleRpm: 0,
    currentEngineRpm: 0,
    accelerationX: 0, // In the car's local space; X = right, Y = up, Z = forward
    accelerationY: 0,
    accelerationZ: 0,
    velocityX: 0, // In the car's local space; X = right, Y = up, Z = forward
    velocityY: 0,
    velocityZ: 0,
    angularVelocityX: 0, // In the car's local space; X = pitch, Y = yaw, Z = roll
    angularVelocityY: 0,
    angularVelocityZ: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    normalizedSuspensionTravelFrontLeft: 0, // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
    normalizedSuspensionTravelFrontRight: 0,
    normalizedSuspensionTravelRearLeft: 0,
    normalizedSuspensionTravelRearRight: 0,
    tireSlipRatioFrontLeft: 0, // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
    tireSlipRatioFrontRight: 0,
    tireSlipRatioRearLeft: 0,
    tireSlipRatioRearRight: 0,
    wheelRotationSpeedFrontLeft: 0, // Wheel rotation speed radians/sec.
    wheelRotationSpeedFrontRight: 0,
    wheelRotationSpeedRearLeft: 0,
    wheelRotationSpeedRearRight: 0,
    wheelOnRumbleStripFrontLeft: 0, // = 1 when wheel is on rumble strip, = 0 when off.
    wheelOnRumbleStripFrontRight: 0,
    wheelOnRumbleStripRearLeft: 0,
    wheelOnRumbleStripRearRight: 0,
    wheelInPuddleDepthFrontLeft: 0, // = from 0 to 1, where 1 is the deepest puddle
    wheelInPuddleDepthFrontRight: 0,
    wheelInPuddleDepthRearLeft: 0,
    wheelInPuddleDepthRearRight: 0,
    surfaceRumbleFrontLeft: 0, // Non-dimensional surface rumble values passed to controller force feedback
    surfaceRumbleFrontRight: 0,
    surfaceRumbleRearLeft: 0,
    surfaceRumbleRearRight: 0,
    tireSlipAngleFrontLeft: 0, // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
    tireSlipAngleFrontRight: 0,
    tireSlipAngleRearLeft: 0,
    tireSlipAngleRearRight: 0,
    tireCombinedSlipFrontLeft: 0, // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
    tireCombinedSlipFrontRight: 0,
    tireCombinedSlipRearLeft: 0,
    tireCombinedSlipRearRight: 0,
    suspensionTravelMetersFrontLeft: 0, // Actual suspension travel in meters
    suspensionTravelMetersFrontRight: 0,
    suspensionTravelMetersRearLeft: 0,
    suspensionTravelMetersRearRight: 0,
    carOrdinal: 0,           // Unique ID of the car make/model
    carClass: 0,             // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
    carPerformanceIndex: 0,  // Between 100 (slowest car) and 999 (fastest car) inclusive
    drivetrainType: 0,       // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
    numCylinders: 0,         // Number of cylinders in the engine

    // Dash
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    speed: 0,
    power: 0,
    torque: 0,
    tireTempFrontLeft: 0,
    tireTempFrontRight: 0,
    tireTempRearLeft: 0,
    tireTempRearRight: 0,
    boost: 0,
    fuel: 0,
    distance: 0,
    bestLapTime: 0,
    lastLapTime: 0,
    currentLapTime: 0,
    currentRaceTime: 0,
    lap: 0,
    racePosition: 0,
    accelerator: 0,
    brake: 0,
    clutch: 0,
    handbrake: 0,
    gear: 0,
    steer: 0,
    normalDrivingLine: 0,
    normalAiBrakeDifference: 0,

    // FM8 extend
    tireWearFrontLeft: 0,
    tireWearFrontRight: 0,
    tireWearRearLeft: 0,
    tireWearRearRight: 0,
    trackOrdinal: 0,

};
