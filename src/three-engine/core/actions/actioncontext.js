class ActionContext {
    constructor(code, msg, data) {
        this._code = code ? code : 0;
        this._msg = msg ? msg : '';
        this._data = data ? data : {};
    }

    get code() {
        return this._code;
    }

    set code(code) {
        this._code = code;
    }

    get msg() {
        return this._msg;
    }

    set msg(msg) {
        this._msg = msg;
    }

    get data() {
        return this._data;
    }

    set data(data) {
        this._data = data;
    }

    error(msg, data) {
        this._code = 1;
        if (msg) {
            this._msg = msg;
        } else {
            this._msg = 'ctx error';
        }
        if (data) {
            this._data = data;
        }
        return this;
    }

    ok(msg, data) {
        this._code = 0;
        if (msg) {
            this._msg = msg;
        }
        else {
            this._msg = '';
        }
        if (data) {
            this._data = data;
        }
        return this;
    }
}

export { ActionContext }