import { Text } from './text';
import { entityTypes } from '../../../../core/model/entitytypes';
import { EntitySet } from '../entityset';
import { DirtyType } from '../../../../core/display/dirtytype';

class TextSet extends EntitySet {
    constructor() {
        super(entityTypes.TextSet);
    }

    static self(design) {
        return design.getBestEntity(entityTypes.TextSet);
    }

    static kids(design) {
        return EntitySet.getKids(design, entityTypes.TextSet);
    }

    static setup(design) {
        let p = TextSet.self(design);
        if (!p) {
            p = new TextSet();
            design.addEntity(p);
        }
        return p;
    }

    static createText(design, strtext, pos) {
        let textset = TextSet.setup(design);
        let text = new Text();
        text.text = strtext;
        text.setPosition(pos);
        text.dirty = DirtyType.All;
        text.design = this.design;
        textset.add(text);
        return text;
    }

    serializedMetaData() {
        return {
            className: 'TextSet',
            schemaVersion: 0
        };
    }

    static make() {
        let p = new TextSet();
        return p;
    }
}

export { TextSet }