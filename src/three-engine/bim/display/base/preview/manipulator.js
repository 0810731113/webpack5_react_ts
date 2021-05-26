import * as THREE from 'three'
import { ManipulatorEventsHandler } from './handler';
import { Plane } from './plane';
import { Viewable } from '../../../../core/display/viewable';
import { DirtyType } from '../../../../core/display/dirtytype';

class Manipulator extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._meshes = new Map();
        this._handler = null;
        this._normalMaterial = null;
        this._hlMaterial = null;
        this._pos = null;
        this._hlMesh = null;
        this._gizmo = null;
    }

    get handler() {
        return this._handler;
    }

    get rotationNode() {
        return this._rotationNode;
    }

    get gizmoT() {
        return this._gizmo.gizmo['T'];
    }

    get gizmoR() {
        return this._gizmo.gizmo['R']
    }

    get gizmoRR() {
        return this._gizmo.gizmo['RR']
    }

    isPreview() {
        return true;
    }

    destroy() {
        super.destroy();
        this._meshes.clear();
        this._handler.destory();
        this.destoryNode(this._gizmo);
    }
    
    createHandler(p) {
        this._handler = new ManipulatorEventsHandler(p.camera, p.domElement, p.object, p.viewer);
        this.controller.handler = this._handler;
        this._object = p.object;
    }

    snap(quat) {
        let euler = new THREE.Euler();
        euler.setFromQuaternion(quat, 'XYZ');
        let flag = 1;
        let angle = euler.z;
        if (angle < 0) {
            flag = -1;
        }
        angle = Math.abs(angle);
        let bOK = false;
        let f = 0;
        let s = angle / (Math.PI / 4);
        let t = Math.floor(s + 0.5);
        let r = Math.abs(s - t);
        if (r < 0.2) {
            f = t * Math.PI / 4;
            bOK = true;
        }

        f *= flag;
        if (bOK) {
            euler.z = f;
            quat = new THREE.Quaternion();
            quat.setFromEuler(euler);
        }
        return quat;
    }

    _createGizmo() {
    }
 
    _drawGrips() {
    }

    onTransform() {
    }

    _onCreateSceneNode() {
        this._node.children = [];
        this._gizmo = this._createGizmo();
        this._gizmo.handler = this._handler;
        this._gizmo.build();
        this._node.add(this._gizmo);
        this._meshes.clear();
        this._node.traverse(itr => {
            if (itr instanceof THREE.Mesh || itr instanceof THREE.Line) {
                this._meshes.set(itr.uuid, itr);
            }
        });
        let plane = new Plane();
        this._setTransform(this._object);
        this._realized = true;
        this._handler.setData(plane, this);
        this.context.viewer.onSceneNodeCreated(this);
        this._entity.dirty = DirtyType.Nothing;
        this._context.needsRendering = true;
        this._entity.dirty = DirtyType.Nothing;
    }

    createSceneNode() {
        super.createSceneNode();
        this._entity.dirty = DirtyType.Nothing;
    }

    _setTransform(viewable) {
        this._node.position.copy(viewable.getManipulatorCenter());
        if(this.gizmoR) {
            this.gizmoR.quaternion.copy(viewable.quaternion);
        }
    }

    highlight(mesh) {
        if (!mesh) {
            return;
        }
        if (this._updateVis(mesh, true)) {
            return;
        }

        if (this._hlMesh && this._hlMesh.name != mesh.name) {
            this.unhighlight(this._hlMesh);
            this._hlMesh = null;
        }
        if (!this._normalMaterial) {
            this._normalMaterial = mesh.material.clone();
        }
        if (!this._hlMaterial) {
            this._hlMaterial = this._normalMaterial.clone();
            this._hlMaterial.opacity = 0.99;
            this._hlMaterial.color.set(0xffff00);
        }
        this._hlMesh = mesh;
        mesh.material = this._hlMaterial;
        this._entity.dirty = DirtyType.Material;
    }

    unhighlight(mesh) {
        if (!mesh || !mesh.tag) {
            return;
        }
        if (this._updateVis(mesh, false)) {
            return;
        }

        if (!this._normalMaterial) {
            return;
        }

        mesh.material = this._normalMaterial.clone();
        this._normalMaterial = null;
        this._entity.dirty = DirtyType.Material;
    }

    refresh() {
        this._context.needsRendering = true;
    }

    lookup(uuid) {
        return this._meshes.get(uuid);
    }

    calcScale(dist, zoom) {
    }

    _updateVis(mesh, vis) {
        let bOK = false;
        if (!mesh) {
            return bOK;
        }
        if (mesh.name == 'RZ') {
            let kids = mesh.parent.children;
            for (let i = 0; i < kids.length; i++) {
                let kid = kids[i];
                if (kid.tag == 'RR') {
                    kid.visible = vis;
                    bOK = true;
                    break;
                }
            }
            this._context.needsRendering = true;
        }
        return bOK;
    }

    onGripsChanged(viewable, axis, pos) {
    }

    onEntityChanged(entity) {
        if(entity == this._object._entity) {
            this._entity.mtxLocal = entity.mtxLocal.clone();
            this._entity.dirty = DirtyType.Transform;
            this._context.needsRendering = true;
        }
    }
}

export { Manipulator }