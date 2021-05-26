import Entity from '../../core/model/entity';
import { entityTypes } from '../../core/model/entitytypes';
import pako from 'pako'

class Asset extends Entity {
    constructor() {
        super(entityTypes.Asset);
        this._data = new Map();
    }

    load(data) {
        switch (data.aspectKey) {
            case 'aspect-common-property':
                this._loadBinary(data.aspectData);
                break;
            case 'aspect-bim-param':
                this._loadJson(data.aspectData);
                break;
        }
    }

    _loadJson(data) {
        this._data.set('json', data);
    }

    _loadBinary(data) {
        let binaryData = atob(data).split('').map(function (e) {
            return e.charCodeAt(0);
        });
        let text = pako.ungzip(binaryData, { to: 'string' });
        let json = JSON.parse(text);
        this._data.set('binary', json);
    }
}

export { Asset }