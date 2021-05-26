import * as THREE from 'three'
import { Viewable } from 'three-engine/core/display/viewable';
import { Text2d } from 'three-engine/bim/display/2d/annotation/text/text';
import { Text } from 'three-engine/bim/model/objects/annotation/text';

class Dim extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._text = null;
    }

    get scalar() {
        return this._context.viewer.dimPreviewFontScale;
    }

    _onCreateSceneNode() {
    }

    _offset(base, vec, dist) {
        let v = new THREE.Vector3();
        v.addVectors(base.clone(), vec.clone().multiplyScalar(dist));
        return v;
    }

    _drawText(strtext, dir, pos) {
        let text = new Text();
        text.text = strtext;
        let text2d = new Text2d(this._scene, this._context, text);
        text2d._onCreateSceneNode();
        let node = text2d.node;
        node.position.copy(pos);
        node.scale.setScalar(this.scalar);
        let bbx = new THREE.Box3().setFromObject(node);
        let size = bbx.getSize(new THREE.Vector3());
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
        let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        node.quaternion.copy(quat);
        this._node.add(node);
        this._text = text2d;
        return { w: size.x, h: size.y };
    }

    _createLine(s, e, mid, dir, size, mat) {
        let dist = s.distanceTo(mid) - size.w / 2;
        let A = this._offset(s, dir, dist);
        let B = this._offset(mid, dir, size.w / 2);
        let l1 = this._drawTool.createLineWith2Points(s, A, mat.clone());
        let l2 = this._drawTool.createLineWith2Points(B, e, mat.clone());
        this._node.add(l1);
        this._node.add(l2);
    }

    _distance(start, end) {
        let v = new THREE.Vector3();
        v.subVectors(end, start);
        return v.length();
    }
}

export { Dim }