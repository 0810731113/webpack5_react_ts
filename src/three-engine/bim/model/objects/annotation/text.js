import { entityTypes } from 'three-engine/core/model/entitytypes';
import { Annotation } from 'three-engine/core/model/annotation';

class Text extends Annotation {
    constructor() {
        super(entityTypes.Text);
    }

    serializedMetaData() {
        return {
            className: 'Text',
            schemaVersion: 0
        };
    }

    static make() {
        let text = new Text();
        return text;
    }
}

export { Text }