import { Viewable } from '../../../../core/display/viewable';
import * as THREE from 'three'
import { DirtyType } from '../../../../core/display/dirtytype';
import { Application } from '../../../../core/application';
import { AxisHead } from './axishead';
import { MeshStates, MeshState } from 'three-engine/core/display/meshstates';
import { EventsManager } from 'three-engine/core/events/manager';
import { Events } from 'three-engine/core/events/events';


class AxisLine2d extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._header = null;
        this._states = null;
        this._isDragging = false;
        this._meshes = new Map();
        this._buildStates();
    }

    set isDragging(p) {
        this._isDragging = p;
    }

    get pivotStart() {
        return this._header.pivotStart;
    }

    get pivotEnd() {
        return this._header.pivotEnd;
    }

    get innerMesh() {
        return this._header.innerMesh;
    }

    _buildStates() {
        this._states = new MeshStates();
        let dash = new MeshState();
        let head = new MeshState();
        this._states.add('dash', dash);
        this._states.add('head', head);
        const previewColor = 0x13c2c2;
        const highlightColor = 0x87e8de;
        const selectColor = 0x13c2c2;
        const normalColor = 0x737373;
        dash.matNormal = new THREE.LineDashedMaterial({ color: normalColor, linewidth: 1, gapSize: 400, dashSize: 600 });;
        dash.matHL = new THREE.LineDashedMaterial({ color: highlightColor, linewidth: 1, gapSize: 400, dashSize: 600 });
        dash.matSelected = new THREE.LineDashedMaterial({ color: selectColor, linewidth: 1, gapSize: 400, dashSize: 600 });
        dash.matDrag = new THREE.LineDashedMaterial({ color: selectColor, linewidth: 1, gapSize: 400, dashSize: 600 });
        dash.matPreview = new THREE.LineDashedMaterial({ color: previewColor, linewidth: 1, gapSize: 400, dashSize: 600 });
        head.matNormal = new THREE.LineBasicMaterial({ color: normalColor });
        head.matHL = new THREE.LineBasicMaterial({ color: highlightColor });
        head.matSelected = new THREE.LineBasicMaterial({ color: selectColor });
        head.matDrag = new THREE.LineBasicMaterial({ color: selectColor });
        head.matPreview = new THREE.LineBasicMaterial({ color: previewColor });
    }

    _onCreateSceneNode() {
        let font = Application.instance().font;
        if (!font.loaded) {
            this._pending = true;
            return;
        }
        this._header = null;
        this._states.resetMesh();
        let s = this._entity.start;
        let e = this._entity.end;
        let v = [];
        v.push(s.x);
        v.push(s.y);
        v.push(s.z);
        v.push(e.x);
        v.push(e.y);
        v.push(e.z);
        let data = {};
        data.vertices = v;
        let line = this.drawTool.createDashedLine(data, this._states.getDefaultMaterial('dash'));
        this._node.add(line);
        let H = this._drawHead();
        this._node.add(H);
        let HL = this._drawHeadLines();
        this._node.add(HL);
        this._states.fillMeshes('dash', [line]);
        this._header = H;
        this._entity.dirty = DirtyType.Nothing;
        this._pending = false;
        
        this.applyMaterial(this._isDragging ? 'drag' : 'normal');
        if (Application.instance().isRunningRapidAxisGrid) {
            EventsManager.instance().dispatch(Events.fitView);
        }
        this.applyTransform();
    }

    _drawHead() {
        let v = this._context.viewer;
        let p = new AxisHead(v, this._entity, this._drawTool, v.pl);
        p.draw();
        return p;
    }

    _drawHeadLines() {
        let node = new THREE.Object3D();
        let s = this._entity.start;
        let e = this._entity.end;
        s = new THREE.Vector3(s.x, s.y, s.z);
        e = new THREE.Vector3(e.x, e.y, e.z);
        let dir = this._entity.dir;
        let s1 = new THREE.Vector3().addVectors(s, dir.clone().multiplyScalar(-this._entity.startExt));
        let e1 = new THREE.Vector3().addVectors(e, dir.clone().multiplyScalar(this.entity.endExt));
        let l1 = this._drawTool.createLineWith2Points(s1, s, this._states.getDefaultMaterial('head'));
        let l2 = this._drawTool.createLineWith2Points(e, e1, this._states.getDefaultMaterial('head'));
        node.add(l1);
        node.add(l2);
        this._states.fillMeshes('head', [l1, l2]);
        return node;
    }

    applyMaterial(option) {
        this._states.apply(option);
        if (this._header) {
            this._header.applyMaterial(option);
        }
        this._context.needsRendering = true;
    }

    drawOutline() {
    }
}

export { AxisLine2d }