import * as THREE from 'three'
import { Application } from 'three-engine/core/application';
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { Dim } from 'three-engine/bim/display/base/objects/dim/dim';
import { DimEditor } from 'commands/dimEditor';
import { AxisDim } from '../../objects/axisdim';

class AxisGridDimPreview extends Dim {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._data = null;
        this._option = null;
        this._editBox = null;
        this._handler = null;
        this._hostViewable = null;
        this._text = null;
        this._pl = context.viewer.pl;
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
                this._drawDim(itr.org, itr.pt);
            }
        });
        this._entity.dirty = DirtyType.Nothing;
    }

    _drawDim(start, end) {
        if (this._distance(start, end) < Application.instance().global.minDimGap) {
            return;
        }
        let viewer = this._context.viewer;

        let p = new AxisDim(viewer, viewer.pl, this, start, end);
        p.draw(start, end);
        this.node.add(p);
        let dir = new THREE.Vector3().subVectors(end, start).normalize();
        let mid = new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2, 0);
        let text = this._displayText(start, end);
        this._drawText(text, dir, mid);
        this._node.position.z = 1;
    }

    onUpdate(pos) {
        if (this._editBox) {
            let viewer = this._context.viewer;
            let pt = viewer.model2screen(pos.clone());
            let r = this._context.clientRect;
            this._editBox.setPosition(pt.x - r.left, pt.y - r.top);
        }
    }

    _displayText(start, end) {
        let dist = this._distance(start, end);
        dist = dist.toFixed(0);
        return dist.toString();
    }

    _drawText(strtext, dir, pos) {
        let edit = this._data.dimEditable;
        if (!edit) {
            return super._drawText(strtext, dir, pos);
        }
        if (!this._editBox) {
            this._editBox = new DimEditor(this._context.containerElement);
        }
        let viewer = this._context.viewer;
        let pt = viewer.model2screen(pos.clone());
        let r = this._context.clientRect;
        this._editBox.setCallback((value) => this._onEdit(value, dir));
        this._editBox.setPosition(pt.x - r.left, pt.y - r.top);
        this._editBox.fillText(strtext);
        return { w: 0, h: 0 };
    }
    
    _onEdit(val, dir) {
        return this._handler ? this._handler.onEdit(val, dir) : false; 
    }

    onPreDelete() {
        if (this._editBox) {
            this._editBox.destroy();
            this._editBox = null;
        }
    }

    _getRotation(ps, pe) {
        let viewer = this._context.viewer;
        let s = viewer.model2screen(ps);
        let e = viewer.model2screen(pe);
        let dir = new THREE.Vector3().subVectors(new THREE.Vector3(e.x, e.y, 0), new THREE.Vector3(s.x, s.y, 0));
        dir.normalize();
        let start = new THREE.Vector3(1, 0, 0);
        let end = dir.clone();
        let normal = new THREE.Vector3();
        normal.copy(start).cross(end);
        let axis = new THREE.Vector3(0, 0, 1);
        let angle = start.angleTo(end) * (normal.dot(axis) < 0 ? -1 : 1);
        if (angle < 0) {
            angle = Math.PI * 2 + angle;
        }
        if (angle > Math.PI / 2 && angle <= Math.PI * 3 / 2) {
            angle -= Math.PI;
        }
        return angle * 180 / Math.PI;
    }
}

export { AxisGridDimPreview }