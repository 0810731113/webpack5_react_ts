import { ColorSchemeTypes } from './types';
import { WhiteScheme } from './scheme/white';
import { BlackScheme } from './scheme/black';
import { Application } from '../../../core/application';

class ColorSchemeManager {
    constructor() {
        this._scheme = WhiteScheme.make();
    }

    applyScheme(type) {
        if (type === this._scheme.type) {
            return;
        }

        let p = null;
        switch (type) {
            case ColorSchemeTypes.White:
                p = WhiteScheme.make();
                break;
            case ColorSchemeTypes.Black:
                p = BlackScheme.make();
                break;
        }
        if (!p) {
            return;
        }

        this._scheme = p;
        Application.instance().viewers.forEach(itr => {
            if (itr.initialized) {
                itr.onColorSchemeChanged();
            }
        });
    }

    get scheme() {
        return this._scheme;
    }
}

export { ColorSchemeManager }