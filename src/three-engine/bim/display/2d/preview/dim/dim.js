import * as THREE from 'three'
import { Application } from 'three-engine/core/application';
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { Dim } from 'three-engine/bim/display/base/objects/dim/dim';

class DimPreview extends Dim {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._data = null;
        this._option = null;
        this._editBox = null;
        this._handler = null;
        this._hostViewable = null;
    }

    setData(data) {
        this._data = data;
    }

    set handler(p) {
        this._handler = p;
    }

    set option(option) {
        this._option = option;
    }

    get hostViewable() {
        return this._hostViewable;
    }

    set hostViewable(value) {
        this._hostViewable = value;
    }

    _onCreateSceneNode() { 
        if (!this._data) {
            return;
        }
        let font = Application.instance().font;
        if (!font.loaded) {
            this._pending = true;
            return;
        }
        this._pending = false;
        this._data.forEach(itr => {
            if (itr) {
                if(this.hostViewable && this.hostViewable.ignoreDim(itr)) {
                    return;
                }
                this._drawDim(itr.org, itr.pt, itr.extra);
            }
        });
        this._entity.dirty = DirtyType.Nothing;
    }

    _drawDim(start, end, extra) {
        if (this._distance(start, end) < Application.instance().global.minDimGap) {
            return;
        }
        
        const dist = (this._option && this._option.Dist) ? this._option.Dist : 200;
        let dir = new THREE.Vector3().subVectors(end, start);
        dir.normalize();
        let nor = dir.clone();
        nor.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        nor.normalize();
        let neg = nor.clone().negate();
        neg.normalize();
        let displayT1 = this._option && this._option.T1;
        let useDefinedColor = this._option && this._option.UseDefinedColor;
        let color = this.getColor(ColorSchemeDefs.DIM2d_LINE_PREVIEW);
        let mat = new THREE.LineBasicMaterial({ color: useDefinedColor ? this._option.C : color, depthTest: false, transparent: true, opacity: 0.5 });
        let upLen = (this._option && this._option.Top) ? this._option.Top : dist;
        if (displayT1) {
            let t1S = this._offset(start, nor, upLen);
            let t1E = this._offset(start, neg, dist);
            let T1 = this._drawTool.createLineWith2Points(t1S, t1E, mat);
            this._node.add(T1);
        }
        let t2S = this._offset(end, nor, upLen);
        let t2E = this._offset(end, neg, dist);
        let T2 = this._drawTool.createLineWith2Points(t2S, t2E, mat);
        if (extra) {
            let matExtra = new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false, transparent: false, opacity: 0.5 });
            let E = this._drawTool.createLineWith2Points(end, extra, matExtra);
            this._node.add(E);
        }
        let mid = new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2, 0);
        let strText = this._displayText(start, end);
        let size = this._drawText(start, strText, dir, mid);
        this._createLine(start, end, mid, dir, size, mat);
        this._node.add(T2);
        this._node.position.z = 1;
    }

    _displayText(start, end) {
        let dist = this._distance(start, end);
        dist = dist.toFixed(0);
        return dist.toString();
    }

    _drawText(start, strtext, dir, pos) {
        if (!this._data.edit) {
            return super._drawText(strtext, dir, pos);
        }

        // if (!this._editBox) {
        //     this._editBox = new AnnotationInput(this._context.containerElement);
        // }
        // let viewer = this._context.viewer;
        // let pt = viewer.model2screen(pos.clone());
        // let r = this._context.clientRect;
        // this._editBox.setCallback((value) => this._onEdit(value, dir));
        // this._editBox.setPosition(pt.x - r.left, pt.y - r.top);
        // this._editBox.setText(strtext);
        return { w: 0, h: 0 };
    }
    
    _onEdit(value, dir) {
        return this._handler ? this._handler.onEdit(value, dir) : false;
    }

    onPreDelete() {
        if (this._editBox) {
            this._editBox.destroy();
            this._editBox = null;
        }
    }
}

export { DimPreview }