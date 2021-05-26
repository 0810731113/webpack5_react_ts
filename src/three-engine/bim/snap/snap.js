class Snap {
    constructor(data) {
        this._type = null;
        this._result = {};
        this._data = data;
    }

    get type() {
        return this._type;
    }

    get result() {
        return this._result;
    }

    get data() {
        return this._data;
    }

    set data(p) {
        this._data = p;
    }

    work(pos) {
        return false;
    }

    _isEqual(d1, d2) {
        return Math.abs(d1 - d2) < 0.001;
    }
}

export { Snap }