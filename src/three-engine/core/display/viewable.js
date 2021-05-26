import * as THREE from 'three'
import { ControllerManager } from './controllermanager';
import { DirtyType } from './dirtytype';
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';

class Viewable {
    constructor(scene, context, entity) {
        this._scene = scene;
        this._node = new THREE.Object3D();
        this._context = context;
        this._entity = entity;
        this._unitScale = 1;
        this._drawTool = this._context.viewer.drawTool;
        this._outline = new THREE.Object3D();
        this._is2d = false;
        this._box = null;
        this._pending = false;
        this._selectionLowerPrioity = false;
        this._useSharedMaterial = false;
        this._displayed = false;
        this._pendingToDraw = false;
        this._ssLevel = 0;
    }

    get ssLevel() {
        return this._ssLevel;
    }
    
    get pendingToDraw() {
        return this._pendingToDraw;
    }

    set pendingToDraw(p) {
        this._pendingToDraw = p;
    }

    get displayed() {
        return this._displayed;
    }

    set displayed(v) {
        this._displayed = v;
    }

    get cruiseAvailable() {
        return false;
    }

    get canCopy() {
        return this._entity ? this._entity.canCopy : false;
    }

    set useSharedMaterial(v) {
        this._useSharedMaterial = v;
    }

    get shownAsBackground() {
        return this._entity.shownAsBackground;
    }

    get controller() {
        let entity = this._entity;
        let comp = entity.component
        let controller = ControllerManager.instance().getController(entity.type, this._context.viewer.type, comp, this);
        if (!controller) {
            return ControllerManager.instance().defaultController;
        }
        controller.setEntity(this);
        return controller;
    }

    getColor(id) {
        return this._context.viewer.getColor(id);
    }

    makeColor(id) {
        return this._context.viewer.makeColor(id);
    }

    getOpacity(id) {
        return this._context.viewer.getOpacity(id);
    }

    selectionLowerPrioity() {
        return this._selectionLowerPrioity;
    }

    alreadySelected(entity) {
        let bOK = false;
        let ss = this._context.viewer.selector.ss();
        for (let i = 0; i < ss.length; i++) {
            if (ss[i] == entity) {
                bOK = true;
                break;
            }
        }
        return bOK;
    }

    get drawTool() {
        return this._drawTool;
    }

    get pending() {
        return this._pending;
    }

    get node() {
        return this._node;
    }

    get context() {
        return this._context;
    }

    get entity() {
        return this._entity;
    }

    get unitScale() {
        return this._unitScale;
    }

    set unitScale(s) {
        this._unitScale = s;
    }

    _getExtraScale() {
        return 1;
    }

    get materialReplaceable() {
        return false;
    }

    get inferable() {
        return false;
    }

    ignoreDim(dim) {
        return false;
    }

    applyTransform() {
        let mtxModel2World = new THREE.Matrix4().multiplyMatrices(this.entity.mtxLocal, this.mtxModel);
        let trans = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        mtxModel2World.decompose(trans, quaternion, scale);
        this._node.position.copy(trans);
        this._node.quaternion.copy(quaternion);
        scale.multiplyScalar(this._getExtraScale());
        this._node.scale.copy(scale);
    }

    get mtxModel() {
        return new THREE.Matrix4();
    }

    get quaternion() {
        let t = new THREE.Vector3();
        let r = new THREE.Quaternion();
        let s = new THREE.Vector3();
        this._entity.mtxLocal.decompose(t, r, s);
        return r;
    }

    get adsorbTypes() {
        return this._entity.adsorbTypes;
    }

    get outline() {
        return this._outline;
    }

    _calcRotation(q) {
        let modelT = new THREE.Vector3();
        let modelR = new THREE.Quaternion();
        let modelS = new THREE.Vector3();
        this.mtxModel.decompose(modelT, modelR, modelS);
        let qCopy = q.clone();
        return qCopy.multiply(modelR);
    }

    setRotation(q) {
        let t = new THREE.Vector3();
        let r = new THREE.Quaternion();
        let s = new THREE.Vector3();
        this._entity.mtxLocal.decompose(t, r, s);
        const mtxLocal = new THREE.Matrix4();
        mtxLocal.compose(t, q, s);
        this._entity.mtxLocal = mtxLocal;
        let rot = this._calcRotation(q);
        this._node.quaternion.copy(rot.clone());
        this._outline.quaternion.copy(rot.clone());
    }

    isPreview() {
        return false;
    }

    mtxLocal() {
        return this._entity.mtxLocal;
    }

    destroy() {
        this._onUnlistenEvents();
        this._scene.remove(this._node);
        this._scene.remove(this._outline);
        this.destroyNode(this._node);
        this.destroyNode(this._outline);
        this._node = undefined;
        this._outline = undefined;
        this._context.needsRendering = true;
    }

    drawOutline(meshId, highlightedColor = 0x00ffff) {
        this.hideOutline();
        let pos = this._node.position.clone();
        let rot = this._node.quaternion.clone();
        this._node.position.set(0, 0, 0);
        this._node.quaternion.copy(new THREE.Quaternion());
        this._box = new THREE.BoxHelper(this._node, highlightedColor);
        this._box.material = new THREE.LineBasicMaterial({ color: highlightedColor, depthTest: false });
        this._node.position.copy(pos.clone());
        this._node.quaternion.copy(rot.clone());
        this._outline.add(this._box);
        this._outline.position.copy(pos);
        this._outline.quaternion.copy(rot);
    }

    getCenter() {
        if (!this._node) {
            return;
        }

        let bbox = new THREE.Box3();
        bbox.setFromObject(this._node);
        let max = bbox.max;
        let min = bbox.min;
        return new THREE.Vector3(max.x - min.x, max.y - min.y, max.z - min.z);
    }

    getManipulatorCenter() {
        return this.node.position;
    }

    hideOutline() {
        this.destroyNode(this._box);
        if (this._outline) {
            this._outline.children = [];
        }
        this._box = null;
        this._context.needsRendering = true;
    }

    setPosition(pos) {
        this._node.position.copy(pos.clone());
        this._outline.position.copy(pos.clone());
        this._entity.mtxLocal.setPosition(pos.clone());
    }

    movable() {
        return this._entity ? this._entity.movable() : false;
    }

    hideManipulator() {
        return false;
    }

    isSelected() {
        let bOK = false;
        let selector = this.context.viewer.selector;
        let ents = selector.ss();
        for (let i = 0; i < ents.length; i++) {
            if (ents[i].id == this._entity.id) {
                bOK = true;
                break;
            }
        }
        return bOK;
    }

    _onListenEvents() {
    }

    _onUnlistenEvents() {
    }

    createSceneNode() {
        if (this._entity.dirty == DirtyType.Nothing && !this._pending) {
            return;
        }
        switch (this._entity.dirty) {
            case DirtyType.Transform:
                this.applyTransform();
                this._context.needsRendering = true;
                return;
            case DirtyType.Material:
                this._context.needsRendering = true;
                return;
            case DirtyType.Workarea:
                this._context.needsRendering = true;
                return;
            case DirtyType.Visibility:
                if (this._node.children.length > 0) {
                    this._node.visible = this._entity.vis;
                    this._context.needsRendering = true;
                    return;
                }
        }

        // destroy the node if created
        //
        let viewer = this._context.viewer;
        if (this._node && this._node.children.length > 0) {
            viewer.onSceneNodeDestroyed(this);
            this._scene.remove(this._node);
            this._scene.remove(this._outline);
            this.destroyNode(this._node);
            this.destroyNode(this._outline);
            this._node = new THREE.Object3D();
            this._outline = new THREE.Object3D();
        }
        if (!this._node) {
            this._node = new THREE.Object3D();
        }
        if (!this._outline) {
            this._outline = new THREE.Object3D();
        }
        this._onCreateSceneNode();

        this._scene.add(this._node);
        this._scene.add(this._outline);
        viewer.onSceneNodeCreated(this);
        if (this.isSelected()) {
            this.drawOutline();
        }
        this._context.needsRendering = true;
    }

    getMetaSize() {
        return null;
    }

    getBoundingBox(prodInfo) {
        return {
            boundWidthX: prodInfo.boundWidthX,
            boundHeightY: prodInfo.boundHeightY,
            boundDepthZ: prodInfo.boundDepthZ
        };
    }

    getBoundingBoxPoints() {
        if (!this._node) {
            return null;
        }

        let pos = this._node.position.clone();
        let rot = this._node.quaternion.clone();
        let size = null;
        if (this._node.children.length < 1) {
            size = this.getMetaSize();
        } else {
            this._node.position.set(0, 0, 0);
            this._node.quaternion.copy(new THREE.Quaternion());
            let bbx = new THREE.Box3().setFromObject(this._node);
            let s = bbx.getSize(new THREE.Vector3());
            size = { width: s.x, height: s.y };
            this._node.position.copy(pos.clone());
            this._node.quaternion.copy(rot.clone());
        }

        if (!size) {
            return null;
        }
        let w = size.width / 2;
        let h = size.height / 2;
        let p1 = new THREE.Vector3(-w, h, 0);
        let p2 = new THREE.Vector3(-w, -h, 0);
        let p3 = new THREE.Vector3(w, -h, 0);
        let p4 = new THREE.Vector3(w, h, 0);
        let arr = [p1, p2, p3, p4];
        return arr;
    }

    getInferencePoints() {
        let r = [];
        let arr = this.getBoundingBoxPoints();
        if (!arr) {
            return null;
        }
        let rot = this._node.quaternion.clone();
        let nodePosition = this._node.position.clone();
        if (this._node.children.length > 0) {
            this._node.quaternion.copy(new THREE.Quaternion());
            let nodeBox = new THREE.Box3().setFromObject(this._node);
            let nodeCenter = nodeBox.getCenter(new THREE.Vector3());
            let position2Center = new THREE.Vector3().subVectors(nodeCenter, nodePosition);
            arr.map(bdryPnt => bdryPnt.add(position2Center));
            this._node.quaternion.copy(rot);
        }

        arr.forEach(itr => {
            let v = itr;
            v.applyQuaternion(rot);
            let pt = new THREE.Vector3().addVectors(v, nodePosition);
            r.push(pt);
        });
        return r;
    }

    getInferencePointsFromBoxHelper() {
        let mtxModel = this.mtxModel;
        let t = new THREE.Vector3();
        let r = new THREE.Quaternion();
        let s = new THREE.Vector3();
        mtxModel.decompose(t, r, s);
        let rot = this._node.quaternion.clone();
        let pos = this._node.position.clone();
        this._node.position.copy(t);
        this._node.quaternion.copy(r);
        let box = new THREE.Box3();
        box.setFromObject(this._node);
        this._node.position.copy(pos);
        this._node.quaternion.copy(rot);
        let mtxLocal = this.entity.mtxLocal;
        t = new THREE.Vector3();
        r = new THREE.Quaternion();
        s = new THREE.Vector3();
        mtxLocal.decompose(t, r, s);
        let min = box.min;
        let max = box.max;
        let p1 = new THREE.Vector3(min.x, min.y, min.z);
        let p2 = new THREE.Vector3(max.x, min.y, min.z);
        let p3 = new THREE.Vector3(max.x, max.y, min.z);
        let p4 = new THREE.Vector3(min.x, max.y, max.z);
        let rr = [];
        let arr = [p1, p2, p3, p4];
        arr.forEach(itr => {
            let v = itr;
            v.applyQuaternion(r);
            let pt = new THREE.Vector3().addVectors(v, t);
            rr.push(pt);
        });
        return rr;
    }

    getBox() {
        let arr = this.getInferencePoints();
        if (!arr) {
            return null;
        }
        let box = new THREE.Box3().setFromPoints(arr);
        return box;
    }

    _onCreateSceneNode() {
    }

    destroyNode(node) {
        if (!node) {
            return;
        }
        node.traverse(child => {
            var geometry = child.geometry;
            if (geometry) {
                geometry.dispose();
                child.geometry = undefined;
            }
            if (!this._useSharedMaterial) {
                let mat = child.material;
                if (mat) {
                    this._drawTool.disposeMaterial(mat);
                    child.material = undefined;
                }
            }

            if (child instanceof THREE.Mesh || child instanceof THREE.Sprite || child instanceof THREE.Line || child instanceof THREE.LineSegments) {
                child = undefined;
            }
        });
        node.children = [];
        node = undefined;
    }

    getFaceByMeshId(meshId) {
        let meshes = this._getMeshMap(this._node);
        let node = meshes.get(meshId);
        let id = this._getFaceId(node);
        let face = this._entity.body.lookupFace(id);
        return { node: node, face: face };
    }

    assignMaterial(node, material) {
        if (!node || !material) {
            return;
        }
        this._drawTool.assignMaterial(node, material).then(() => {
            this._onMaterialApplied(material);
        }).catch(err => { console.log(err) });
    }

    _onMaterialApplied(mat) {
        let data = {};
        data.viewable = this;
        data.material = mat;
        EventsManager.instance().dispatch(Events.materialApplied, data);
        this._context.needsRendering = true;
    }

    _getMeshes(node) {
        let meshes = [];
        if (!node) {
            return;
        }
        node.traverse(itr => {
            if (itr instanceof THREE.Mesh) {
                meshes.push(itr);
            }
        });
        return meshes;
    }

    _getMeshMap(node) {
        let meshes = new Map();
        if (!node) {
            return;
        }
        node.traverse(itr => {
            if (itr instanceof THREE.Mesh) {
                meshes.set(itr.uuid, itr);
            }
        });
        return meshes;
    }

    _getFaceId(node) {
        let faceNode = this._getFaceNode(node);
        return faceNode ? faceNode.tag : null;
    }

    _getFaceNode(node) {
        if (!node) {
            return null;
        }
        if (node.tag) {
            return node;
        }
        return this._getFaceNode(node.parent);
    }

    _drawPreview() {
        const comp = this._entity.comp;
        if (!comp) {
            return;
        }
        const boundingBox = this.getBoundingBox(comp.prodInfo);
        let width, depth, height, scale;
        if (boundingBox) {
            width = boundingBox.boundWidthX;
            depth = boundingBox.boundHeightY;
            height = boundingBox.boundDepthZ;
            scale = 1;
        } else {
            width = 400;
            depth = 300;
            height = 200;
            scale = 2;
        }

        let box = new THREE.BoxGeometry(width, depth, height);
        let vertices = box.vertices;
        for (let i = 0; i < vertices.length; i++) {
            let v = vertices[i];
            v.z += height / 2;
            vertices[i] = new THREE.Vector3(v.x, v.y, v.z);
        }
        let material = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: this._opacity });
        this._preview = new THREE.Mesh(box, material);
        this._preview.scale.setScalar(scale);
        this._node.add(this._preview);
        this.applyTransform();
    }

    get hasControlPoints() {
        return false;
    }

    updateResolution() {}

    onColorSchemeChanged() {
    }

    pickable() {
        return this.node.visible;
    }
}

export { Viewable }