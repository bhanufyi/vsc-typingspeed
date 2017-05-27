export default class RollingArray {
    private _data = [];
    private _size: number;
    private _first: number = 0;
    private _last: number = -1;

    constructor(size) {
        this._size = size;
    }

    add(x) {
        this._last += 1;
        if (this._last === this._size) this._last = 0;

        this._data[this._last] = x;

        if (this._data.length === this._size) {
            this._first += 1;
            if (this._first === this._size) this._first = 0;
        }
    }

    clear() {
        this._data = [];
        this._size = 0;
        this._first = 0;
        this._last = -1;
    }

    size(): number {
        return this._data.length;
    }

    first() {
        return this._data[this._first];
    }

    last() {
        return this._data[this._last];
    }
}