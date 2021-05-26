class EventsManager {
    constructor() {
        this._listeners = {};
        this._instance = null;
    }

    static instance() {
        if(!this._instance) {
            this._instance = new EventsManager();
        }
        return this._instance;
    }

    listen(evt, handler, context) {
        let handlers = this._listeners[evt];
        if (handlers === undefined) {
            handlers = [];
            this._listeners[evt] = handlers;
        }
        let item = {
            handler: handler,
            context: context
        };
        handlers.push(item);
        return item;
    }

    unlisten(evt, handler, context) {
        let handlers = this._listeners[evt];
        if (handlers !== undefined) {
            let size = handlers.length;
            for (let i = 0; i < size; i++) {
                let item = handlers[i];
                if (item.handler === handler && item.context === context) {
                    handlers.splice(i, 1);
                    return;
                }
            }
        }
    }

    dispatch(evt, data) {
        let hanlders = this._listeners[evt];
        if (hanlders !== undefined) {
            let size = hanlders.length;
            for (let i = 0; i < size; i++) {
                let p = hanlders[i];
                if (p) {
                    let handler = p.handler;
                    let context = p.context;
                    handler.apply(context, [data]);
                }
            }
        }
    }

    onDesignClosed() {
        for (const key in this._listeners) {
            const handlers = this._listeners[key];
            const deletingHandlers = [];
            for (const p of handlers) {
                if (p && p.context) {
                    deletingHandlers.push(p);
                }
            }

            deletingHandlers.forEach(p => {
                const index = handlers.indexOf(p);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            });
        }
    }
}

export { EventsManager }