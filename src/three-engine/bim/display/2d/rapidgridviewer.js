import * as THREE from 'three'
import { AxisLine } from 'three-engine/bim/model/objects/axisline';
import { AxisMark } from './objects/axismark';
import { Viewer2d } from './viewer';

class RapidGridViewer2d extends Viewer2d {
    constructor() {
        super();
        this._type = 'RapidGridViewer2d';
        this._pl = null;
        this._mark = null;
    }

    set compass(p) {
    }

    isDraggable(p) {
        return false;
    }

    isEditable(p) {
        return false;
    }

    _drawGrid() {
        super._drawGrid();
        let scene = this._scene.background;
        if (this._mark) {
            scene.remove(this._mark);
            this._mark.traverse(child => {
                var geometry = child.geometry;
                if (geometry) {
                    geometry.dispose();
                    child.geometry = undefined;
                }
                let mat = child.material;
                if (mat) {
                    mat.dispose();  
                    child.material = undefined;
                }
                child = undefined;
            });
            this._mark.children = [];
            this._mark = undefined;
        }
        this._mark = new AxisMark(this);
        this._mark.draw();
        scene.add(this._mark);
    }
}

export { RapidGridViewer2d }
