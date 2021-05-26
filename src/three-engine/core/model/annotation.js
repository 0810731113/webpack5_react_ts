import Entity from './entity';

class Annotation extends Entity {
    constructor(type) {
        super(type);
        this._text = '';
    }

    get text() {
        return this._text;
    }

    set text(t) {
        this._text = t;
    }
    
    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            text: this._text,
        });
    }

    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        this._text = data.text;
    }
}

export { Annotation }