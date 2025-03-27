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

export type MessageDataKey = Exclude<keyof MessageData, "dataType">;

export function parseMessageData(buffer: number[]): MessageData {
    let dataType = DataType.Sled;
    switch (buffer.length) {
        case 232:
            dataType = DataType.Sled;
            break;
        case 324:
            dataType = DataType.FH4Dash;
            break;
        case 311:
            dataType = DataType.FM7Dash;
            break;
        case 331:
            dataType = DataType.FM8Dash;
            break;
        default:
            throw Error(`Unsupported Data (Unknown length: ${buffer.length})`);
    }

    const array = new Uint8Array(buffer);
    const bytes = new DataView(array.buffer);

    function getFloat32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getFloat32(index, true);
    }

    function getInt32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getInt32(index, true);
    }

    function getUint32(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint32(index, true);
    }

    function getUint16(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint16(index, true);
    }

    function getUint8(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getUint8(index);
    }

    function getInt8(bytes: DataView<ArrayBuffer>, index: number) {
        return bytes.getInt8(index);
    }

    function getSled() {
        return {
            isRaceOn: getInt32(bytes, 0),
            timestampMs: getUint32(bytes, 4), // Can overflow to 0 eventually
            engineMaxRpm: getFloat32(bytes, 8),
            engineIdleRpm: getFloat32(bytes, 12),
            currentEngineRpm: getFloat32(bytes, 16),
            accelerationX: getFloat32(bytes, 20), // In the car's local space; X = right, Y = up, Z = forward
            accelerationY: getFloat32(bytes, 24),
            accelerationZ: getFloat32(bytes, 28),
            velocityX: getFloat32(bytes, 32), // In the car's local space; X = right, Y = up, Z = forward
            velocityY: getFloat32(bytes, 36),
            velocityZ: getFloat32(bytes, 40),
            angularVelocityX: getFloat32(bytes, 44), // In the car's local space; X = pitch, Y = yaw, Z = roll
            angularVelocityY: getFloat32(bytes, 48),
            angularVelocityZ: getFloat32(bytes, 52),
            yaw: getFloat32(bytes, 56),
            pitch: getFloat32(bytes, 60),
            roll: getFloat32(bytes, 64),
            normalizedSuspensionTravelFrontLeft: getFloat32(bytes, 68), // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
            normalizedSuspensionTravelFrontRight: getFloat32(bytes, 72),
            normalizedSuspensionTravelRearLeft: getFloat32(bytes, 76),
            normalizedSuspensionTravelRearRight: getFloat32(bytes, 80),
            tireSlipRatioFrontLeft: getFloat32(bytes, 84), // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
            tireSlipRatioFrontRight: getFloat32(bytes, 88),
            tireSlipRatioRearLeft: getFloat32(bytes, 92),
            tireSlipRatioRearRight: getFloat32(bytes, 96),
            wheelRotationSpeedFrontLeft: getFloat32(bytes, 100), // Wheel rotation speed radians/sec.
            wheelRotationSpeedFrontRight: getFloat32(bytes, 104),
            wheelRotationSpeedRearLeft: getFloat32(bytes, 108),
            wheelRotationSpeedRearRight: getFloat32(bytes, 112),
            wheelOnRumbleStripFrontLeft: getFloat32(bytes, 116), // = 1 when wheel is on rumble strip, = 0 when off.
            wheelOnRumbleStripFrontRight: getFloat32(bytes, 120),
            wheelOnRumbleStripRearLeft: getFloat32(bytes, 124),
            wheelOnRumbleStripRearRight: getFloat32(bytes, 128),
            wheelInPuddleDepthFrontLeft: getFloat32(bytes, 132), // = from 0 to 1, where 1 is the deepest puddle
            wheelInPuddleDepthFrontRight: getFloat32(bytes, 136),
            wheelInPuddleDepthRearLeft: getFloat32(bytes, 140),
            wheelInPuddleDepthRearRight: getFloat32(bytes, 144),
            surfaceRumbleFrontLeft: getFloat32(bytes, 148), // Non-dimensional surface rumble values passed to controller force feedback
            surfaceRumbleFrontRight: getFloat32(bytes, 152),
            surfaceRumbleRearLeft: getFloat32(bytes, 156),
            surfaceRumbleRearRight: getFloat32(bytes, 160),
            tireSlipAngleFrontLeft: getFloat32(bytes, 164), // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
            tireSlipAngleFrontRight: getFloat32(bytes, 168),
            tireSlipAngleRearLeft: getFloat32(bytes, 172),
            tireSlipAngleRearRight: getFloat32(bytes, 176),
            tireCombinedSlipFrontLeft: getFloat32(bytes, 180), // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
            tireCombinedSlipFrontRight: getFloat32(bytes, 184),
            tireCombinedSlipRearLeft: getFloat32(bytes, 188),
            tireCombinedSlipRearRight: getFloat32(bytes, 192),
            suspensionTravelMetersFrontLeft: getFloat32(bytes, 196), // Actual suspension travel in meters
            suspensionTravelMetersFrontRight: getFloat32(bytes, 200),
            suspensionTravelMetersRearLeft: getFloat32(bytes, 204),
            suspensionTravelMetersRearRight: getFloat32(bytes, 208),
            carOrdinal: getInt32(bytes, 212),           // Unique ID of the car make/model
            carClass: getInt32(bytes, 216), // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
            carPerformanceIndex: getInt32(bytes, 220), // Between 100 (slowest car) and 999 (fastest car) inclusive
            drivetrainType: getInt32(bytes, 224), // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
            numCylinders: getInt32(bytes, 228), // Number of cylinders in the engine
        };
    }

    function getDash() {
        const fh4_buffer_offset = 12;
        switch (dataType) {
            case DataType.FH4Dash:
                return {
                    positionX: getFloat32(bytes, 232 + fh4_buffer_offset),
                    positionY: getFloat32(bytes, 236 + fh4_buffer_offset),
                    positionZ: getFloat32(bytes, 240 + fh4_buffer_offset),
                    speed: getFloat32(bytes, 244 + fh4_buffer_offset),
                    power: getFloat32(bytes, 248 + fh4_buffer_offset),
                    torque: getFloat32(bytes, 252 + fh4_buffer_offset),
                    tireTempFrontLeft: getFloat32(bytes, 256 + fh4_buffer_offset),
                    tireTempFrontRight: getFloat32(bytes, 260 + fh4_buffer_offset),
                    tireTempRearLeft: getFloat32(bytes, 264 + fh4_buffer_offset),
                    tireTempRearRight: getFloat32(bytes, 268 + fh4_buffer_offset),
                    boost: getFloat32(bytes, 272 + fh4_buffer_offset),
                    fuel: getFloat32(bytes, 276 + fh4_buffer_offset),
                    distance: getFloat32(bytes, 280 + fh4_buffer_offset),
                    bestLapTime: getFloat32(bytes, 284 + fh4_buffer_offset),
                    lastLapTime: getFloat32(bytes, 288 + fh4_buffer_offset),
                    currentLapTime: getFloat32(bytes, 292 + fh4_buffer_offset),
                    currentRaceTime: getFloat32(bytes, 296 + fh4_buffer_offset),
                    lap: getUint16(bytes, 300 + fh4_buffer_offset),
                    racePosition: getUint8(bytes, 302 + fh4_buffer_offset),
                    accelerator: getUint8(bytes, 303 + fh4_buffer_offset),
                    brake: getUint8(bytes, 304 + fh4_buffer_offset),
                    clutch: getUint8(bytes, 305 + fh4_buffer_offset),
                    handbrake: getUint8(bytes, 306 + fh4_buffer_offset),
                    gear: getUint8(bytes, 307 + fh4_buffer_offset),
                    steer: getInt8(bytes, 308 + fh4_buffer_offset),
                    normalDrivingLine: getInt8(bytes, 309 + fh4_buffer_offset),
                    normalAiBrakeDifference: getInt8(bytes, 310 + fh4_buffer_offset),
                };
            case DataType.FM7Dash:
            case DataType.FM8Dash:
                return {
                    positionX: getFloat32(bytes, 232),
                    positionY: getFloat32(bytes, 236),
                    positionZ: getFloat32(bytes, 240),
                    speed: getFloat32(bytes, 244),
                    power: getFloat32(bytes, 248),
                    torque: getFloat32(bytes, 252),
                    tireTempFrontLeft: getFloat32(bytes, 256),
                    tireTempFrontRight: getFloat32(bytes, 260),
                    tireTempRearLeft: getFloat32(bytes, 264),
                    tireTempRearRight: getFloat32(bytes, 268),
                    boost: getFloat32(bytes, 272),
                    fuel: getFloat32(bytes, 276),
                    distance: getFloat32(bytes, 280),
                    bestLapTime: getFloat32(bytes, 284),
                    lastLapTime: getFloat32(bytes, 288),
                    currentLapTime: getFloat32(bytes, 292),
                    currentRaceTime: getFloat32(bytes, 296),
                    lap: getUint16(bytes, 300),
                    racePosition: getUint8(bytes, 302),
                    accelerator: getUint8(bytes, 303),
                    brake: getUint8(bytes, 304),
                    clutch: getUint8(bytes, 305),
                    handbrake: getUint8(bytes, 306),
                    gear: getUint8(bytes, 307),
                    steer: getInt8(bytes, 308),
                    normalDrivingLine: getInt8(bytes, 309),
                    normalAiBrakeDifference: getInt8(bytes, 310),
                };
        }
        return dashExtendTemplate;
    }

    function getFm8Extend() {
        switch (dataType) {
            case DataType.FM8Dash:
                return {
                    tireWearFrontLeft: getFloat32(bytes, 311),
                    tireWearFrontRight: getFloat32(bytes, 315),
                    tireWearRearLeft: getFloat32(bytes, 319),
                    tireWearRearRight: getFloat32(bytes, 323),
                    trackOrdinal: getInt32(bytes, 327),
                };
        }
        return fm8DashExtendTemplate;
    }

    return {
        dataType,
        ...getSled(),
        ...getDash(),
        ...getFm8Extend(),
    };
}

const sledTemplate = {
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
};

const dashExtendTemplate = {
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

const fm8DashExtendTemplate = {
    tireWearFrontLeft: 0,
    tireWearFrontRight: 0,
    tireWearRearLeft: 0,
    tireWearRearRight: 0,
    trackOrdinal: 0,
};

export const dummyMessageData: MessageData = {
    dataType: DataType.Sled,
    // Sled
    ...sledTemplate,

    // Dash
    ...dashExtendTemplate,

    // FM8 extend
    ...fm8DashExtendTemplate,
};

const sledValidKeys = new Set(Object.keys(sledTemplate));
const fh4DashValidKeys = new Set([...Object.keys(sledTemplate), ...Object.keys(dashExtendTemplate)]);
const fm7ValidKeys = new Set([...Object.keys(sledTemplate), ...Object.keys(dashExtendTemplate)]);
const fm8ValidKeys = new Set([...Object.keys(sledTemplate), ...Object.keys(dashExtendTemplate), ...Object.keys(fm8DashExtendTemplate)]);
const noValidKeys = new Set();

export function getValidKeys(dataType?: DataType) {
    switch (dataType) {
        case DataType.Sled:
            return sledValidKeys;
        case DataType.FH4Dash:
            return fh4DashValidKeys;
        case DataType.FM7Dash:
            return fm7ValidKeys;
        case DataType.FM8Dash:
            return fm8ValidKeys;
        default:
            return noValidKeys;
    }
}

export function isValidProp(dataType: DataType | undefined, key: MessageDataKey) {
    const validKeys = getValidKeys(dataType);
    return validKeys.has(key);
}
