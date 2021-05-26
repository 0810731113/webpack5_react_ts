class ColorSchemeBase {
    constructor(type) {
        this._type = type;
        this._dict = new Map();
    }

    get type() {
        return this._type;
    }

    lookup(key) {
        return this._dict.get(key);
    }

    _init() {
        this._dict.clear();
        let arr = this._getConfig();
        for (let i = 0; i < arr.length; i += 2) {
            let key = arr[i];
            let val = arr[i + 1];
            this._dict.set(key, val);
        }
        return this;
    }

    _getConfig() {
        return [];
    }
}

export { ColorSchemeBase }