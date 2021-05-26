class TransactionMemento {
    constructor() {
        this._mementoMap = new Map();
    }

    get(key) {
        return this._mementoMap.get(key);
    }

    set(key, value) {
        this._mementoMap.set(key, value);
    }
}

export default TransactionMemento;