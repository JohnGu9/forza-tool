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

export type MessageDataAnalysis = {
    maxPower: number;
    powerCurve: Map<number/* rpm */, { power: number, torque: number; }>;
    speed: CircularBuffer<number>,
    stamp: number;
};

export function newMessageDataAnalysis(capacity: number): MessageDataAnalysis {
    return { maxPower: 0, powerCurve: new Map(), speed: new CircularBuffer<number>(capacity), stamp: 0 };
}

export function resetMessageDataAnalysis(analysis: MessageDataAnalysis, capacity: number) {
    analysis.maxPower = 0;
    analysis.powerCurve.clear();
    analysis.speed = new CircularBuffer(capacity);
    analysis.stamp = 0;
}

export function analyzeMessageData(messageData: CircularBuffer<MessageData>, analysis: MessageDataAnalysis) {
    let changed = false;
    const lastMessageData = messageData.getLastUnsafe();
    const recordPower = analysis.powerCurve.get(lastMessageData.currentEngineRpm);
    if (recordPower === undefined || recordPower.power < lastMessageData.power) {
        analysis.powerCurve.set(lastMessageData.currentEngineRpm, { power: lastMessageData.power, torque: lastMessageData.torque });
        changed = true;
    }

    if (analysis.maxPower < lastMessageData.power) {
        analysis.maxPower = lastMessageData.power;
        changed = true;
    }

    if (messageData.getElementCount() > 1) {
        const lastIndex = messageData.getUpperBound();
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
