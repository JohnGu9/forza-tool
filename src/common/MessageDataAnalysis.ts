import CircularBuffer from "./CircularBuffer";
import { MessageData } from "./MessageData";
import quickSearch from "./QuickSearch";

export class ConsumptionEstimation {
    protected _start!: MessageData;
    protected _end!: MessageData;

    protected _fuel = 0; // unit time consumption
    protected _tireWear = 0; // unit time consumption

    reset() {
        this._start = this._end;
        this._fuel = 0;
        this._tireWear = 0;
    }

    getPerLapConsumption() {
        const lapTime = this.getLapTime();
        if (lapTime === 0) {
            return {
                fuel: 0,
                tireWear: 0,
            };
        }
        return {
            fuel: this._fuel * lapTime,
            tireWear: this._tireWear * lapTime,
        };
    }

    getUnitTimeConsumption() {
        return {
            fuel: this._fuel,
            tireWear: this._tireWear,
        };
    }

    // 100% fuel and 100% tire wear
    estimateLaps() {
        const lapTime = this.getLapTime();
        if (lapTime === 0) {
            return {
                fuel: 0,
                tireWear: 0,
            };
        }
        const fuelRemainTime = this._fuel === 0 ? 0 : 1 / this._fuel;
        const tireWearRemainTime = this._tireWear === 0 ? 0 : 1 / this._tireWear;

        return {
            fuel: fuelRemainTime / lapTime,
            tireWear: tireWearRemainTime / lapTime,
        };
    }

    static estimateRemainLaps(perLapConsumption: { fuel: number, tireWear: number; }, data: MessageData) {
        const fuel = perLapConsumption.fuel === 0 ? 0 : data.fuel / perLapConsumption.fuel;
        if (perLapConsumption.tireWear === 0) {
            return {
                fuel,
                tireWear50: 0,
                tireWear65: 0,
            };
        }
        const maxTireWear = Math.max(data.tireWearFrontLeft, data.tireWearFrontRight, data.tireWearRearLeft, data.tireWearRearRight);
        return {
            fuel,
            tireWear50: (0.5 - maxTireWear) / perLapConsumption.tireWear,
            tireWear65: (0.65 - maxTireWear) / perLapConsumption.tireWear,
        };
    }

    getLapTime() {
        return this._end?.currentLapTime ?? 0;
    }

    getStartFuel() {
        return this._start?.fuel ?? 0;
    }

    setStart(start: MessageData) {
        this._start = start;
    }

    compute(end: MessageData) {
        this._end = end;

        const duration = this._end.currentLapTime - this._start.currentLapTime; // unit: sec
        const deltaFuel = this._end.fuel - this._start.fuel;
        const deltaTireWearFrontLeft = this._end.tireWearFrontLeft - this._start.tireWearFrontLeft;
        const deltaTireWearFrontRight = this._end.tireWearFrontRight - this._start.tireWearFrontRight;
        const deltaTireWearRearLeft = this._end.tireWearRearLeft - this._start.tireWearRearLeft;
        const deltaTireWearRearRight = this._end.tireWearRearRight - this._start.tireWearRearRight;

        if (deltaFuel < 0) {
            this._fuel = - deltaFuel / duration;
        }

        if (deltaTireWearFrontLeft > 0 &&
            deltaTireWearFrontRight > 0 &&
            deltaTireWearRearLeft > 0 &&
            deltaTireWearRearRight > 0) {
            const deltaTireWearMax = Math.max(deltaTireWearFrontLeft, deltaTireWearFrontRight, deltaTireWearRearLeft, deltaTireWearRearRight);
            this._tireWear = deltaTireWearMax / duration;
        }
    }
};

export function isValidPowerDiff(powerDiff: number) {
    return powerDiff > 0.999 && powerDiff < 1.001;
}

export class MessageDataAnalysis {
    id = 0;

    maxPower = { value: 0, rpm: 0, torque: 0 };
    powerCurve: { rpm: number, power: number, torque: number; }[] = [];
    powerDiff: CircularBuffer<number>;
    distance: CircularBuffer<number>;
    velocity: CircularBuffer<number>;
    velocityPrediction: CircularBuffer<number>;
    consumptionEstimation = new ConsumptionEstimation();
    isFullAcceleratorForAWhile = false; // @TODO: maybe remove this

    constructor(capacity: number) {
        this.powerDiff = new CircularBuffer<number>(capacity);
        this.distance = new CircularBuffer<number>(capacity);
        this.velocity = new CircularBuffer<number>(capacity);
        this.velocityPrediction = new CircularBuffer<number>(capacity);
    }

    reset() {
        this.id += 1;

        this.maxPower = { value: 0, rpm: 0, torque: 0 };
        this.powerCurve = [];
        this.powerDiff.clear();
        this.distance.clear();
        this.velocity.clear();
        this.velocityPrediction.clear();
        this.consumptionEstimation.reset();
        this.isFullAcceleratorForAWhile = false;
    }

    analyze(messageData: CircularBuffer<MessageData>/* not empty ensure */) {
        const lastData = messageData.slice(-6);
        const lastMessageData = lastData[lastData.length - 1];
        const isFullAcceleratorForAWhile = lastData.every(v => v.accelerator > 248 && v.gear === lastData[0].gear);

        const powerPrediction = 1000 * lastMessageData.torque * lastMessageData.currentEngineRpm / 9550;
        const powerDiff = lastMessageData.power / powerPrediction;// There is diff, I don't know why? Power delay?
        this.powerDiff.push(powerDiff);

        if (isValidPowerDiff(powerDiff)) {
            validData(this, lastMessageData);
        }

        if (lastData.length > 1) {
            const beforeLast = lastData[lastData.length - 2];
            this.distance.push(toDistance(lastMessageData, beforeLast));

            const timeDelta = lastMessageData.timestampMs - lastData[0].timestampMs;
            this.velocity.push(timeDelta <= 0 ? 0 : toVelocity(this.distance.slice(-Math.max(lastData.length - 1, 0)), timeDelta / 1000));

            const timeDeltaSmall = lastMessageData.timestampMs - beforeLast.timestampMs;
            this.velocityPrediction.push(timeDeltaSmall <= 0 ? 0 : getVelocityPrediction(beforeLast, timeDeltaSmall / 1000));

            if (lastMessageData.trackOrdinal !== beforeLast.trackOrdinal) {
                this.consumptionEstimation.reset();
                this.consumptionEstimation.setStart(lastMessageData);
            } else if (this.consumptionEstimation.getStartFuel() < lastMessageData.fuel) {
                this.consumptionEstimation.setStart(lastMessageData);
            } else if (lastMessageData.lap !== beforeLast.lap) { // new lap
                if (lastMessageData.lap - beforeLast.lap === 1) {
                    this.consumptionEstimation.compute(beforeLast);
                }
                this.consumptionEstimation.setStart(lastMessageData);
            }

        } else { // lastData.length === 1
            this.distance.push(0);
            this.velocity.push(0);

            if (lastData.length !== 0) {
                const last = lastData[0];
                this.velocityPrediction.push(toScalar({ x: last.velocityX, y: last.velocityY, z: last.velocityZ }));
            } else {
                this.velocityPrediction.push(0);
            }
        }

        this.isFullAcceleratorForAWhile = isFullAcceleratorForAWhile;
    }
};

export function rpmToKey(rpm: number) {
    return rpm.toFixed(0);
}

const MaxFdTolerationFactor = 16;
const MinFdTolerationFactor = 2 / 3;
function validData(analysis: MessageDataAnalysis, lastMessageData: MessageData) {
    if (lastMessageData.power <= 0 ||
        lastMessageData.currentEngineRpm === lastMessageData.engineMaxRpm ||
        lastMessageData.currentEngineRpm === lastMessageData.engineIdleRpm) {
        return false;
    }

    type Element = { power: number, rpm: number, torque: number; };

    const powerCurveData = { power: lastMessageData.power, torque: lastMessageData.torque, rpm: lastMessageData.currentEngineRpm };
    function updateMaxPower() {
        analysis.maxPower = { value: powerCurveData.power, torque: powerCurveData.torque, rpm: powerCurveData.rpm };
    }

    const rpmKey = rpmToKey(powerCurveData.rpm);
    function isSameRpm(rpm: number) {
        return rpmToKey(rpm) === rpmKey;
    }
    function isMaxPowerData(data: Element) {
        return rpmToKey(data.rpm) === rpmToKey(analysis.maxPower.rpm);
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
    // sd means Second Derivative
    function getDerivative(first: { power: number, rpm: number; }, second: { power: number, rpm: number; }) {
        return (second.power - first.power) / (second.rpm - first.rpm);
    }

    if (insertIndex === 0) { // unlikely
        const data = analysis.powerCurve[0];
        const fd1 = getDerivative(powerCurveData, data);

        if (isMaxPower) {
            const minFdToleration = MinFdTolerationFactor * getDerivative(powerCurveData, { power: 0, rpm: lastMessageData.engineMaxRpm });
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
            const maxFdToleration = MaxFdTolerationFactor * getDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, { power: analysis.maxPower.value, rpm: analysis.maxPower.rpm });
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
    } else if (insertIndex === rpmArray.length) {  // unlikely
        const lastIndex = analysis.powerCurve.length - 1;
        const data = analysis.powerCurve[lastIndex];

        if (powerCurveData.rpm === data.rpm) {
            powerCurveData.rpm += Number.MIN_VALUE;
        }
        const fd0 = getDerivative(data, powerCurveData);
        if (isMaxPower) {
            const maxFdToleration = MaxFdTolerationFactor * getDerivative({ rpm: lastMessageData.engineIdleRpm, power: 0 }, powerCurveData);
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
            if (fd0 >= 0) { // powerCurveData is invalid
                return false;
            }
            const minFdToleration = MinFdTolerationFactor * getDerivative({ power: analysis.maxPower.value, rpm: analysis.maxPower.rpm }, { power: 0, rpm: lastMessageData.engineMaxRpm });
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

    const originFd = getDerivative(data0, data1);
    const originTorqueFd = getDerivative({ power: data0.torque, rpm: data0.rpm }, { power: data1.torque, rpm: data1.rpm });

    const fd1 = getDerivative(powerCurveData, data1);
    const torqueFd1 = getDerivative({ power: powerCurveData.torque, rpm: powerCurveData.rpm }, { power: data1.torque, rpm: data1.rpm });

    if (data0.rpm === powerCurveData.rpm) { // unlikely
        // just cheating to handle weird situation, forgive me :)
        // ensure `fd1` is valid.
        powerCurveData.rpm += Number.MIN_VALUE;
    }

    const fd0 = getDerivative(data0, powerCurveData);
    const torqueFd0 = getDerivative({ power: data0.torque, rpm: data0.rpm }, { power: powerCurveData.torque, rpm: powerCurveData.rpm });

    function validTorqueFd(maxFdFactor = 0.5) {
        if ((insertIndex - 2) >= 0 && (insertIndex + 1) <= (analysis.powerCurve.length - 1)) { // likely
            const data00 = analysis.powerCurve[insertIndex - 2];
            const data11 = analysis.powerCurve[insertIndex + 1];
            const torqueFd00 = getDerivative({ power: data00.torque, rpm: data00.rpm }, { power: data0.torque, rpm: data0.rpm });
            const torqueFd11 = getDerivative({ power: data1.torque, rpm: data1.rpm }, { power: data11.torque, rpm: data11.rpm });

            if (torqueFd00 < 0 && torqueFd11 < 0 && originTorqueFd < 0) {
                const maxTorqueFdToleration = maxFdFactor * Math.max(originTorqueFd, torqueFd00, torqueFd11);
                if (torqueFd0 > maxTorqueFdToleration || torqueFd1 > maxTorqueFdToleration) {
                    return false;
                }
            }
        }
        return true;
    }

    if (isMaxPower) {
        if (!validTorqueFd()) {
            return false;
        }
        const maxFdToleration = MaxFdTolerationFactor * getDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, powerCurveData);
        const minFdToleration = MinFdTolerationFactor * getDerivative(powerCurveData, { power: 0, rpm: lastMessageData.engineMaxRpm });

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
        const maxFdToleration = MaxFdTolerationFactor * getDerivative({ power: 0, rpm: lastMessageData.engineIdleRpm }, { power: analysis.maxPower.value, rpm: analysis.maxPower.rpm });
        const minFdToleration = MinFdTolerationFactor * getDerivative({ power: analysis.maxPower.value, rpm: analysis.maxPower.rpm }, { power: 0, rpm: lastMessageData.engineMaxRpm });
        function merge(before: Element | undefined, target: Element, after: Element | undefined) {
            let isBeforeInvalid = false;
            let isAfterInvalid = false;
            let isTargetInvalid = false;
            if (before !== undefined && isSameRpm(before.rpm)) {
                if (before.power < target.power) {
                    isBeforeInvalid = true;
                } else {
                    isTargetInvalid = true;
                }
            }
            if (after !== undefined && isSameRpm(after.rpm)) {
                if (after.power < target.power) {
                    isAfterInvalid = true;
                } else {
                    isTargetInvalid = true;
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
            if (!validTorqueFd()) {
                return false;
            }
            if (fd0 <= 0 && fd0 <= originFd) {
                return false;
            }
            if (fd1 > maxFdToleration) {
                return false;
            }
            const isData0Invalid = fd0 > maxFdToleration;
            const isData1Invalid = fd1 <= 0;
            const m = merge(isData0Invalid ? undefined : data0, powerCurveData, isData1Invalid ? undefined : data1);
            analysis.powerCurve = [...analysis.powerCurve.slice(0, insertIndex - 1), ...m, ...analysis.powerCurve.slice(insertIndex + 1)];
            return true;
        } else { // powerCurveData.rpm > analysis.maxPower.rpm
            if (!validTorqueFd(1)) {
                return false;
            }
            if (isSameRpm(analysis.maxPower.rpm)) {
                return false;
            }
            if (fd1 >= 0) {
                return false;
            }
            if (fd1 >= originFd * MinFdTolerationFactor) {
                return false;
            }
            if (fd0 < minFdToleration) {
                return false;
            }
            const isData0Invalid = fd0 >= 0;
            const isData1Invalid = fd1 < minFdToleration;
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
function toVelocity(distances: number[], timeDelta: number /* unit: s */) {
    if (timeDelta <= 0) { return 0; }
    const distance = distances.reduce((sum, value) => sum += value, 0);
    return distance / timeDelta; // unit: m/s
}
function toDistance(now: Position, before: Position) {
    return toScalar({ x: now.positionX - before.positionX, y: now.positionY - before.positionY, z: now.positionZ - before.positionZ });
}
function toScalar(value: { [key: string]: number; }) {
    const v = Object.values(value).map(v => Math.pow(v, 2));
    const sum = v.reduce((sum, value) => sum + value, 0);
    return Math.pow(sum, 1 / 2);
}
function getVelocityPrediction(data: MessageData, duration: number /* unit: s */) {
    const velocity = {
        x: data.velocityX + data.accelerationX * duration,
        y: data.velocityY + data.accelerationY * duration,
        z: data.velocityZ + data.accelerationZ * duration,
    };
    return toScalar(velocity);
}
