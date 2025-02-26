// Circular buffer storage. Externally-apparent 'length' increases indefinitely
// while any items with indexes below length-n will be forgotten (undefined
// will be returned if you try to get them, trying to set is an exception).
// n represents the initial length of the array, not a maximum

export default class CircularBuffer<T> {
    static IndexError = {};

    protected _array: Array<T>;
    protected _length: number;

    constructor(capacity: number) {
        this._array = new Array(capacity);
        this._length = 0;
    }

    get(i: number) {
        if (i < 0 || i < this._length - this._array.length) {
            return undefined;
        }
        return this._array[i % this._array.length];
    }

    getUnsafe(i: number) {
        return this._array[i % this._array.length];
    }

    getLast() {
        if (this._length === 0) {
            return undefined;
        }
        return this.get(this.getUpperBound() - 1);
    }

    // ensure the buffer is not empty before call this method
    getLastUnsafe() {
        return this._array[(this._length - 1) % this._array.length];
    }

    push(v: T) {
        this._array[this._length % this._array.length] = v;
        this._length++;

        if (this._length === 2 * this._array.length) { // prevent from number overflow 
            this._length = this._array.length;
        }
    }

    clear() {
        this._array.fill(undefined as T);
        this._length = 0;
    }

    getLowerBound() {
        if (this._length < this._array.length) {
            return 0;
        }
        return this._length - this._array.length;
    }

    getUpperBound() {
        return this._length;
    }

    getElementCount() {
        return Math.min(this._length, this._array.length);
    }

    getCapacity() {
        return this._array.length;
    }

    isEmpty() {
        return this._length === 0;
    }

    slice(start: number, end?: number) {
        const upper = this.getUpperBound();
        const lower = this.getLowerBound();
        if (start < 0) {
            const trueStart = Math.max(lower, upper + start);
            const length = upper - trueStart;
            const res = new Array<T>(length);
            for (let i = trueStart, index = 0; i < upper; i++, index++) {
                res[index] = this.getUnsafe(i);
            }
            return res;
        }
        const trueStart = Math.min(Math.max(start, lower), upper);
        const trueEnd = end === undefined ? upper : Math.min(Math.max(lower, end), upper);
        if (trueStart < trueEnd) {
            const length = trueEnd - trueStart;
            const res = new Array<T>(length);
            for (let i = trueStart, index = 0; i < trueEnd; i++, index++) {
                res[index] = this.getUnsafe(i);
            }
            return res;
        } else {
            return [];
        }

    }

    map<X>(fn: (element: T, index: number) => X) {
        const res = new Array<X>(this.getElementCount());
        let index = 0;
        for (const data of this) {
            res[index] = fn(data, index);
            index++;
        }
        return res;
    }

    [Symbol.iterator]() {
        const lowerBound = this.getLowerBound();
        const upperBound = this.getUpperBound();
        let index = lowerBound;
        return {
            next: () => {
                if (index < upperBound) {
                    const i = index++;
                    return {
                        value: this._array[i % this._array.length],
                        done: false,
                    };
                } else {
                    return {
                        value: undefined as T,
                        done: true,
                    };
                }
            },
        };
    }

    toString() {
        return '[object CircularBuffer(' + this._array.length + ') length ' + this._length + ']';
    }
};
