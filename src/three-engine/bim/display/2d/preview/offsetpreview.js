import * as THREE from 'three'
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { Viewable } from 'three-engine/core/display/viewable';
import Point from 'three-engine/core/model/point';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';
import { AxisLine2d } from '../objects/axisline';
import { AxisMark } from '../objects/axismark';


class OffsetPreview extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._viewer = context.viewer;
        this._handler = null;
    }

    set handler(p) {
        this._handler = p;
    }

    _onCreateSceneNode() {
        this._clearDim();
        this._dim = this._viewer.createPreview(PreviewTypes.AxisGridDim);
        this._dim.handler = this;

        let axisline = this._entity.axisline;
        let pivot = this._entity.pivot;
        let pos = this._entity.pos.clone();
        let dir = axisline.dir.clone();
        let norm = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/2);
        norm.normalize();
        let vec = new THREE.Vector3().subVectors(pos, pivot);
        let dist = vec.dot(norm);
        dist = dist.toFixed(0);
        norm.multiplyScalar(dist);
        let ptGlyph = new THREE.Vector3().addVectors(pivot, norm);
        let line = this._drawTool.createLineWith2Points(pivot, ptGlyph, new THREE.LineBasicMaterial({ color: 0x13c2c2, transparent: true, opacity: 0.5 }));
        this._node.add(line);
        let ps = this._entity.src.start;
        let pe = this._entity.src.end;
        let s = new THREE.Vector3().addVectors(new THREE.Vector3(ps.x, ps.y, ps.z), norm);
        let e = new THREE.Vector3().addVectors(new THREE.Vector3(pe.x, pe.y, pe.z), norm);
        axisline.start = new Point(s.x, s.y, s.z);
        axisline.end = new Point(e.x, e.y, e.z);
        let viewable = new AxisLine2d(this._scene, this._context, axisline);
        viewable._onCreateSceneNode();
        viewable.applyMaterial('preview');
        this._node.add(viewable.node);
        this._drawDim(pivot, ptGlyph);
        this._entity.dirty = DirtyType.Nothing;
    }

    drawOutline() {
    }

    destroy() {
        super.destroy();
        this._clearDim();
    }

    _clearDim() {
        if (!this._dim) {
            return null;
        }
        this._dim.onPreDelete();
        this._context.viewer.delViewable(this._dim);
        this._dim = null;
    }

    _drawDim(p0, p1) {
        let dir = p1.clone().sub(p0);
        dir.normalize();
        let axis = new THREE.Vector3(1, 0, 0);
        let q = new THREE.Quaternion().setFromUnitVectors(axis, dir);
        let t = p0.clone();
        let s = new THREE.Vector3(1, 1, 1);
        let m = new THREE.Matrix4().compose(t, q, s);
        const H = 70;
        const L = p0.distanceTo(p1);
        let dd = 300;
        let h = 2 * H + dd;
        let l = L;
        let ps = new THREE.Vector3(0, h, 0);
        let pe = new THREE.Vector3(l, h, 0);
        ps.applyMatrix4(m);
        pe.applyMatrix4(m);
        let data = [{ org: ps, pt: pe, extra: null }];
        data.dimEditable = true;
        this._dim.option = { T1: true, C: 0x000000, Dist: dd, Top: dd * 0.5, UseDefinedColor: false };
        this._dim.setData(data);
    }

    onEdit(val, dir) {
        return this._handler ? this._handler.onEdit(val, dir) : false; 
    }
}

export { OffsetPreview }   