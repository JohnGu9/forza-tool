import CircularBuffer from "./CircularBuffer";

export type MessageData = {
    // Sled
    isRaceOn: boolean,
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
    tireTempFl: number,
    tireTempFr: number,
    tireTempRl: number,
    tireTempRr: number,
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
};

export function parseMessageData(buffer: number[]): MessageData {
    let buffer_offset = 0;
    switch (buffer.length) {
        case 232:
            throw Error("Unsupported Data (FM7 sled)");
        case 311:// FM7 dash
            buffer_offset = 0;
            break;
        case 324:// FH4
            buffer_offset = 12;
            break;
        case 331:// FM8 dash
            buffer_offset = 0;
            break;
        default:
            throw Error(`Unsupported Data (Unknown length: ${buffer.length})`);
    }

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
    return {
        isRaceOn: get_int32(bytes, 0) > 0,
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
        positionX: get_float32(bytes, 232 + buffer_offset),
        positionY: get_float32(bytes, 236 + buffer_offset),
        positionZ: get_float32(bytes, 240 + buffer_offset),
        speed: get_float32(bytes, 244 + buffer_offset),
        power: get_float32(bytes, 248 + buffer_offset),
        torque: get_float32(bytes, 252 + buffer_offset),
        tireTempFl: get_float32(bytes, 256 + buffer_offset),
        tireTempFr: get_float32(bytes, 260 + buffer_offset),
        tireTempRl: get_float32(bytes, 264 + buffer_offset),
        tireTempRr: get_float32(bytes, 268 + buffer_offset),
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

export type MessageDataAnalysis = {
    maxPower: number;
    powerCurve: { [key: number]: { power: number, torque: number; }; };
    speed: CircularBuffer<number>,
    stamp: number;
};

export function newMessageDataAnalysis(capacity: number): MessageDataAnalysis {
    return { maxPower: 0, powerCurve: {}, speed: new CircularBuffer<number>(capacity), stamp: 0 };
}

export function resetMessageDataAnalysis(analysis: MessageDataAnalysis, capacity: number) {
    analysis.maxPower = 0;
    analysis.powerCurve = {};
    analysis.speed = new CircularBuffer(capacity);
    analysis.stamp = 0;
}

export function analyzeMessageData(messageData: CircularBuffer<MessageData>, analysis: MessageDataAnalysis) {
    let changed = false;
    const lastMessageData = messageData.getLastUnsafe();
    const recordPower = analysis.powerCurve[lastMessageData.currentEngineRpm];
    if ((recordPower === undefined && lastMessageData.power !== 0) || (lastMessageData.accelerator === 255 && recordPower.power < lastMessageData.power)) {
        analysis.powerCurve[lastMessageData.currentEngineRpm] = { power: lastMessageData.power, torque: lastMessageData.torque };
        changed = true;
    }

    if (analysis.maxPower < lastMessageData.power) {
        analysis.maxPower = lastMessageData.power;
        changed = true;
    }

    if (messageData.getElementCount() > 1) {
        const lastIndex = messageData.getUpperBound() - 1;
        const secondLastIndex = lastIndex - 1;
        const lastData = messageData.get(lastIndex)!;
        const secondLastData = messageData.get(secondLastIndex)!;
        analysis.speed.push(positionToVelocity(lastData, secondLastData, (lastData.timestampMs - secondLastData.timestampMs) / 1000));
        changed = true;
    }

    if (changed) {
        analysis.stamp += 1;
    }
}

type Position = {
    positionX: number,
    positionY: number,
    positionZ: number,
};// unit: m
function positionToVelocity(now: Position, then: Position, timeDelta: number /* unit: s */) {
    if (timeDelta <= 0) { return 0; }
    const destSquare = Math.pow(now.positionX - then.positionX, 2) +
        Math.pow(now.positionY - then.positionY, 2) +
        Math.pow(now.positionZ - then.positionZ, 2);
    return Math.pow(destSquare, 1 / 3) / timeDelta; // unit: m/s
}

export const dummyMessageData: MessageData = {
    // Sled
    isRaceOn: false,
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
    carClass: 0, // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
    carPerformanceIndex: 0, // Between 100 (slowest car) and 999 (fastest car) inclusive
    drivetrainType: 0, // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
    numCylinders: 0, // Number of cylinders in the engine

    // Dash
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    speed: 0,
    power: 0,
    torque: 0,
    tireTempFl: 0,
    tireTempFr: 0,
    tireTempRl: 0,
    tireTempRr: 0,
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
