import * as THREE from 'three'
import { Object3D } from 'three';
import { Application } from '../application';

class TextMesh2d extends Object3D
{
    constructor(viewer, pl) {
        super();
        this._viewer = viewer;
        this._pl = this._viewer.pixelLength();
        this._arr = [];
    }

    draw(font, text) {
        let matBlack = Application.instance().global.fontFillMaterial.clone();
        let matWhite = Application.instance().global.fontEdgeMaterial.clone();
        let geo = this._createTextGeometry(text, font);
        let meshBlack = this._createText(geo, matBlack);
        let meshWhite = this._createText(geo, matWhite);
        meshBlack.position.x += 0.5;
        meshBlack.position.y -= 0.5;
        meshBlack.position.z += 0.5;
        meshBlack.renderOrder = 10;
        meshWhite.renderOrder = 10;
        this.add(meshWhite);
        this.add(meshBlack);
        this._arr = [meshBlack, meshWhite];
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        let s = this._viewer.pixelLength() / this._pl;
        this._arr.forEach(itr => {
            itr.scale.setScalar(s);
        });
    } 

    _createText(textGeo, mat) {
        let text = new THREE.Mesh(textGeo, mat)
        text.position.x = -1 - textGeo.boundingBox.max.x / 2;
        text.position.y = 1 - textGeo.boundingBox.max.y / 2;
        text.castShadow = false;
        return text;
    }

    _createTextGeometry(strText, font) {
        let shapes = font.generateShapes( strText, 0.8 * this._viewer.pixelLength());
        let textGeo = new THREE.ShapeBufferGeometry( shapes );
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();
        return textGeo;
    }
}

export { TextMesh2d }