import Entity from './entity';
import { entityTypes } from './entitytypes';

class Camera extends Entity {
    constructor() {
        super(entityTypes.Camera);
    }

    serializedMetaData() {
        return {
            className: 'Camera',
            schemaVersion: 0
        };
    }

    static make() {
        let camera = new Camera();
        return camera;
    }
}

export { Camera }