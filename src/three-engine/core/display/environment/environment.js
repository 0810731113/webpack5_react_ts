class Environment {
    constructor(type) {
        this._type = type;

        this._visibilityOptions = new Map();
    }

    get type() {
        return this._type;
    }

    get visibilityOptions() {
        return this._visibilityOptions;
    }
    getVisibilityOptionValue(option) {
        return this._visibilityOptions.get(option);
    }
    setVisibilityOptionValue(option, value) {
    }

    onEnter() {
        this._visibilityOptions.forEach((v, k) => {
            this.setVisibilityOptionValue(k, v);
        })
    }

    onLeave() {
    }

    createViewable(creator, entity) {
        return null;
    }

    isVisibleForViewCulling(ent, viewCulling) {
        return viewCulling;
    }

    _getViewers() {
        return [];
    }

    _showEntity(visible, ents) {
        let needsRendering = false;
        const viewers = this._getViewers();
        ents.forEach(ent => {
            viewers.forEach(viewer => {
                const viewable = viewer.lookupViewable(ent);
                if (viewable) {
                    viewable.node.visible = visible;
                }
            });

            needsRendering = true;
        });

        if (needsRendering) {
            viewers.forEach(viewer => {
                viewer.context.needsRendering = needsRendering;
            });
        }
    }
}

export { Environment }