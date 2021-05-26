import * as THREE from 'three'
import { Application } from 'three-engine/core/application';
import { MeshState, MeshStates } from 'three-engine/core/display/meshstates';

class AxisHead extends THREE.Object3D {
    constructor(viewer, entity, drawTool, pl) {
        super();
        this._mesh = null;
        this._viewer = viewer;
        this._pl = pl;
        this._entity = entity;
        this._drawTool = drawTool;
        this._map = new Map();
        this._arr = [];
        this._pivotStart = null;
        this._pivotEnd = null;
        this._states = null;
        this._dia = 16.5;
        this._innerMesh = new Map();
        this._buildStates();
    }

    get pivotStart() {
        return this._pivotStart;
    }

    get pivotEnd() {
        return this._pivotEnd;
    }

    get innerMesh() {
        return this._innerMesh;
    }

    draw() {
        this._map.clear();
        this._innerMesh.clear();
        this._arr = [];
        this._states.resetMesh();
        this.createCircle(true);
        this.createCircle(false);
        this._pivotStart = this._drawTerminalPoint(this._entity.start);
        this._pivotEnd = this._drawTerminalPoint(this._entity.end);
        let font = Application.instance().font;
        this._drawText(font, true);
        this._drawText(font, false);
    }

    get size() {
        return this._pl;
    }

    _buildStates() {
        this._states = new MeshStates();
        let inner = new MeshState();
        let outer = new MeshState();
        let text = new MeshState();
        let terminal = new MeshState();
        this._states.add('inner', inner);
        this._states.add('outer', outer);
        this._states.add('text', text);
        this._states.add('terminal', terminal);
        const previewColor = 0x13c2c2;
        const highlightColor = 0x87e8de;
        const selectColor = 0x13c2c2;
        const normalColor = 0x737373;
        inner.matNormal = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.99 });
        inner.matHL = new THREE.MeshBasicMaterial({ color: highlightColor, transparent: true, opacity: 0.19 });
        inner.matSelected = new THREE.MeshLambertMaterial({ color: selectColor, depthTest: false, transparent: true, opacity: 0.19, depthWrite: false });
        inner.matDrag = new THREE.MeshLambertMaterial({ color: selectColor, depthTest: false, transparent: true, opacity: 0.19, depthWrite: false });
        inner.matPreview = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.99 });
        outer.matNormal = new THREE.LineBasicMaterial({ color: normalColor, depthTest: false, depthWrite: false, transparent: true, opacity: 0.99 });
        outer.matHL = new THREE.LineBasicMaterial({ color: highlightColor, depthTest: false, depthWrite: false, transparent: true, opacity: 0.99 });
        outer.matSelected = new THREE.LineBasicMaterial({ color: selectColor, depthTest: false, depthWrite: false, transparent: true, opacity: 0.99 });
        outer.matDrag = new THREE.LineBasicMaterial({ color: selectColor, depthTest: false, depthWrite: false, transparent: true, opacity: 0.99 });
        outer.matPreview = new THREE.LineBasicMaterial({ color: previewColor, depthTest: false, depthWrite: false, transparent: true, opacity: 0.99 });
        text.matNormal = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        text.matHL = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        text.matSelected = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        text.matDrag = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        text.matPreview = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        terminal.matNormal = new THREE.MeshBasicMaterial({ color: normalColor });
        terminal.matHL = new THREE.MeshBasicMaterial({ color: highlightColor});
        terminal.matSelected = new THREE.MeshBasicMaterial({ color: selectColor});
        terminal.matDrag = new THREE.MeshBasicMaterial({ color: selectColor });
        terminal.matPreview = new THREE.MeshBasicMaterial({ color: previewColor });
    }

    _calcStartPos() {
        let dir = this._entity.dir;
        let s = this._entity.start;
        s = new THREE.Vector3(s.x, s.y, s.z);
        let r = this._viewer.pixelLength() * this._dia;
        return new THREE.Vector3().addVectors(s, dir.clone().multiplyScalar(-r - this._entity.startExt));
    }

    _calcEndPos() {
        let dir = this._entity.dir;
        let e = this._entity.end;
        e = new THREE.Vector3(e.x, e.y, e.z);
        let r = this._viewer.pixelLength() * this._dia;
        return new THREE.Vector3().addVectors(e, dir.clone().multiplyScalar(r + this._entity.endExt));
    }

    _drawText(font, start) {
        let text = this._entity.name;
        if (!text) {
            return;
        }
        let size = 4;
        let node = this._drawTool.createTextMesh(font, text, size, 0x000000);
        this.add(node);;
        this._states.fillMeshes('text', [node.children[0]]);
        this._map.set(node, { size: size, start: start });
    }

    createCircle(start) {
        if (start && !this._entity.start) {
            return;
        }
        if (!start && !this._entity.end) {
            return;
        }
        let inner = this._drawCircleInner(this.size * this._dia);
        let outer = this._drawCircleOuter(this.size * this._dia);
        this.add(inner);
        this.add(outer);
        this._map.set(inner, { size: 1, start: start });
        this._map.set(outer, { size: 1, start: start });
        this._innerMesh.set(inner.uuid, start);
    }

    _drawCircleOuter(radius) {
        let geo = new THREE.CircleGeometry(radius, 64);
        geo.vertices.shift();
        let loop = new THREE.LineLoop(geo, this._states.getDefaultMaterial('outer'));
        this._states.fillMeshes('outer', [loop]);
        return loop;
    }

    _drawCircleInner(radius) {
        let geo = new THREE.CircleGeometry(radius, 64);
        let inner = new THREE.Mesh(geo, this._states.getDefaultMaterial('inner'));  
        this._states.fillMeshes('inner', [inner]);
        return inner;
    }

    _drawTerminalPoint(pt) {
        if (!pt) {
            return;
        }
        let geo = new THREE.CircleGeometry(this.size * 6, 64);
        let mesh = new THREE.Mesh(geo, this._states.getDefaultMaterial('terminal'));  
        this.add(mesh);
        this._arr.push(mesh);
        this._states.fillMeshes('terminal', [mesh]);
        mesh.position.copy(new THREE.Vector3(pt.x, pt.y, pt.z));
        mesh.visible = false;
        return mesh;
    }
    
    applyMaterial(option) {
        this._arr.forEach(itr => {
            itr.visible = (option != 'normal' && option != 'preview');
        });
        this._states.apply(option);
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        let s = this._viewer.pixelLength() / this._pl;
        this._map.forEach((v, k) => {
            k.scale.setScalar(s * v.size);
            k.position.copy(v.start ? this._calcStartPos() : this._calcEndPos());
        });
        this._arr.forEach(itr => {
            itr.scale.setScalar(s);
        });
    } 
}

export { AxisHead }