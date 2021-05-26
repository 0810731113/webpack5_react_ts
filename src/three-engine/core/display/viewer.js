import * as THREE from 'three';
import { RenderManager } from './rendermanager';
import { LightingManager } from './lightingmanager';
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';
import { CameraControlManager } from '../camera/manager';
import { CameraMode } from '../camera/mode';
import { Interactor } from '../interaction/interactor';
import { RayPicker } from './raypicker';
import { Selector } from './selector';
import Command from '../commands/command';
import { entityTypes } from '../model/entitytypes';
import { DirtyType } from './dirtytype';
import { Application } from '../application';
import Entity from '../model/entity';
import { Viewable } from './viewable';
import actionManager from '../actions/actionmanager';
import { DrawToolFactory } from './glib/factory';
import { ColorSchemeDefs } from '../../bim/display/colorscheme/def';
import { PreviewTypes } from '../model/previewtypes';

class Viewer {
    constructor() {
        this._domId = null;
        this._domElement = undefined;
        this._viewables = new Map();
        this._context = null;
        this._canvas = undefined;
        this.initialized = false;
        this._renderMgr = null;
        this._lightingMgr = null;
        this._cameraMgr = null;
        this._creator = null;
        this._interactor = null;
        this._picker = null;
        this._selector = null;
        this._scene = null;
        this._defaultCommand = new Command();
        this._type = '';
        this._renderOptions = {};
        this._zoom = 1;
        this._drawTool = DrawToolFactory.create();
        this._controlPoints = null;
        this._grid = null;
        this._pendingToFitView = false;
        this._suspend = false;
    }

    get type() {
        return this._type;
    }

    get drawTool() {
        return this._drawTool;
    }

    get cameraMgr() {
        return this._cameraMgr;
    }

    set suspend(p) {
        this._suspend = p;
    }

    set compass(p) {
        let mtx = new THREE.Matrix4().makeRotationZ(p);
        this._scene.foreground.applyMatrix4(mtx);
        this._context.needsRendering = true;
    }

    isDraggable(p) {
        return true;
    }

    isEditable(p) {
        return true;
    }

    lookupColor(id) {
        return Application.instance().colorSchemeMgr.scheme.lookup(id);
    }

    makeColor(id) {
        let color = this.getColor(id);
        return new THREE.Color(color);
    }

    getColor(id) {
        let data = this.lookupColor(id);
        return data.color;
    }

    getOpacity(id) {
        let data = this.lookupColor(id);
        return data.opa;
    }

    init(domId) {
        this._domId = domId;
        let domElement = document.getElementById(domId);
        if (this.initialized) {
            this._drawTool.reset();
            domElement.insertBefore(this._canvas, domElement.firstChild);
            this._context.clientRect = this._canvas.getBoundingClientRect();
            this._context.containerElement = domElement;
            this._domElement = domElement;
            this.resize(domId);
            return;
        }
        this.initialized = true;
        this._domElement = domElement;
        this._context = this._createContext();
        this._scene = {};
        this._scene.background = new THREE.Scene();
        this._scene.foreground = new THREE.Scene();
        this._setupCamera(this._context);
        this._setupRenderOptions();
        this._renderMgr = new RenderManager(this._context, this._scene, this.context.camera, this._renderOptions);
        this._lightingMgr = new LightingManager();
        this._lightingMgr.setupLighting(this._scene.foreground);
        this._canvas = this._context.canvas;
        domElement.insertBefore(this._canvas, domElement.firstChild);
        this._context.isActive = false;
        this._context.viewer = this;
        this._context.clientRect = this._canvas.getBoundingClientRect();
        this._setupEvents();
        this._drawAxis();

        // setup camera controls
        //
        this._cameraMgr = new CameraControlManager(this._context);
        this._cameraMgr.mode = CameraMode.orbit;
        this._renderMgr.ccmgr(this._cameraMgr);

        // create interactor
        //
        this._interactor = new Interactor(this);
        this._picker = new RayPicker(this._context, this._scene.foreground);
        this._selector = new Selector();
    }

    set linePickPrecision(d) {
        this._picker.linePrecision = d;
    }

    get linePickPrecision() {
        return this._picker.linePrecision;
    }

    _drawAxis() {
    }

    _drawGrid() {
        let scene = this._scene.background;
        if (this._grid) {
            scene.remove(this._grid);
            this._grid.traverse(child => {
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
            this._grid.children = [];
            this._grid = undefined;
        }
        
        let master = this.makeColor(ColorSchemeDefs.SCENE_GRID_MASTER);
        let secondary = this.getColor(ColorSchemeDefs.SCENE_GRID_SECONDARY);
        const grid = new THREE.GridHelper(300000, 300, secondary, secondary);
        let array = grid.geometry.attributes.color.array;
        for (let i = 0; i < array.length; i += 60) {
            for (let j = 0; j < 12; j += 3) {
                array[i + j] = master.r;
                array[i + j + 1] = master.g;
                array[i + j + 2] = master.b;
            }
        }
        grid.geometry.rotateX(Math.PI / 2);
        grid.position.z = -130;
        grid.material.opacity = this.getOpacity(ColorSchemeDefs.SCENE_GRID_MASTER);
        grid.material.transparent = true;
        this._grid = grid;
        scene.add(grid);
    }

    scene() {
        return this._scene.foreground;
    }

    get defaultCommand() {
        return this._defaultCommand;
    }

    terminate() {
        Application.instance().viewers.delete(this.type)
        this.initialized = false;
    }

    hide() {
        if (this._canvas) {
            this._canvas.style.display = 'none';
        }
    }

    show() {
        if (this._canvas) {
            this._canvas.style.display = 'initial';
        }
    }

    get cameraControl() {
        return this._cameraMgr.getControl();
    }

    activate() {
        if (!this.initialized) {
            return;
        }
        this._interactor.registerEvents();
        this._context.isActive = true;
        this._context.needsRendering = true;
        this._cameraMgr.getControl().keys(true);
    }

    deactivate() {
        if (!this.initialized) {
            return;
        }
        this._selector.ssClear();
        this._showManipulator({ selected: false });
        this._interactor.unregisterEvents();
        this._context.isActive = false;
        this._cameraMgr.getControl().keys(false);
    }

    onEnterFirstPersonBefore() {
    }

    get selector() {
        return this._selector;
    }

    get context() {
        return this._context;
    }

    get viewables() {
        return this._viewables;
    }

    get canvas() {
        return this._canvas;
    }

    get isActive() {
        return this._context && this._context.isActive;
    }

    dumpAsJPEG(encode, fitCameral) {
        if(fitCameral){
            this.backupCamera();
            this.fitScreen();
        }

        let data = this._renderMgr.dumpAsJPEG();

        if(fitCameral) {
            this.restoreCamera();
        }

        if (encode) {
            let matches = data.match('^data:(.+);base64,(.+)$');
            let response = {};
            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            data = new Buffer(matches[2], 'base64');
        }
        return data;
    }

    onColorSchemeChanged() {
        if (!this._scene || !this._scene.background) {
            return;
        }
        this._scene.background.background = this.makeColor(ColorSchemeDefs.SCENE_BACKGROUND);
        this._drawGrid();
        this._context.needsRendering = true;
    }

    _onDesignWillClose() {
        if (!this.initialized) {
            return;
        }
        this._selector.ssClear();
    }

    _onDesignClosed() {
        if (!this.initialized) {
            return;
        }
        let self = this;
        this._viewables.forEach(itr => {
            self.delViewable(itr);
        });
        let kids = this._scene.foreground.children;
        this._scene.foreground.children = [];
        kids.forEach(itr => {
            if (itr instanceof THREE.Light) {
                this._scene.foreground.add(itr);
            }
        });
    }

    clearAll() {
        this._onDesignClosed();
    }

    _onProdCleared() {
        if (!this.initialized) {
            return;
        }
        this._selector.ssClear();
        this._viewables.forEach(itr => {
            if (itr.entity.type == entityTypes.Prod) {
                this.delViewable(itr);
            }
        });
        this._context.needsRendering = true;
    }

    _setupRenderOptions() {
        this._renderOptions.alpha = true;
        this._renderOptions.clearOpacity = 0.0;
        this._renderOptions.clearColor = 0x000000;
    }

    _onDesignOpened() {
    }

    _onDesignReady() {
    }

    _onDesignCreated() {
    }

    screen2Canvas(x, y) {
        let r = this._context.clientRect;
        return {
            x: ((x - r.left) / r.width) * 2 - 1,
            y: -((y - r.top) / r.height) * 2 + 1
        };
    }

    pixelLength() {
        let p1 = this.screen2model({ x: 0, y: 0 });
        let p2 = this.screen2model({ x: 1, y: 0 });
        return p1.distanceTo(p2);
    }

    screen2model(ptScreen) {
        let c = this.screen2Canvas(ptScreen.x, ptScreen.y);
        let p = new THREE.Vector3(c.x, c.y, -1).unproject(this._context.camera)
        return p;
    }

    model2screen(ptModel) {
        let r = this._context.clientRect;
        let v = ptModel.clone();
        v.project(this._context.camera);
        return { x: r.left + r.width * (v.x + 1) / 2, y: r.top + r.height * (-v.y + 1) / 2 };
    }

    pick(point, filter) {
        let ptCanvas = this.screen2Canvas(point.x, point.y);
        let infos = this._picker.pick(ptCanvas, false, filter);
        return infos;
    }

    renderFrame(e) {

        if (!this._context) {
            return false;
        }

        this._viewables.forEach(itr => {
            if (itr) {
                itr.createSceneNode();
            }
        });

        return true;
    }

    clearAll() {
        if (!this.initialized) {
            return;
        }
        this._viewables.forEach(itr => {
            this.delViewable(itr);
        });
        let kids = this._scene.foreground.children;
        this._scene.foreground.children = [];
        kids.forEach(itr => {
            if (itr instanceof THREE.Light) {
                this._scene.foreground.add(itr);
            }
        });
    }

    destroy() {

        if (!this.initialized) {
            return;
        }

        this._interactor.destroy();

        // disconnect events
        //
        EventsManager.instance().unlisten(Events.entityAdded, this._onEntityAdded, this);
        EventsManager.instance().unlisten(Events.entityRemoved, this._onEntityRemoved, this);
        EventsManager.instance().unlisten(Events.ssChanged, this._onSSChanged, this);
        EventsManager.instance().unlisten(Events.designWillClose, this._onDesignWillClose, this);
        EventsManager.instance().unlisten(Events.designClosed, this._onDesignClosed, this);
        EventsManager.instance().unlisten(Events.designOpened, this._onDesignOpened, this);
        EventsManager.instance().unlisten(Events.designCreated, this._onDesignCreated, this);
        EventsManager.instance().unlisten(Events.prodCleared, this._onProdCleared, this);
        EventsManager.instance().unlisten(Events.frameRendered, this._onFrameRendered, this);
        EventsManager.instance().unlisten(Events.designReady, this._onDesignReady, this);
        EventsManager.instance().unlisten(Events.fitView, this._onDisplay, this);
        EventsManager.instance().unlisten(Events.projectLoaded, this._onProjectLoaded, this);

        // destroy viewables
        //
        this._viewables.forEach(itr => {
            if (itr) {
                itr.destroy();
            }
        });
        this._viewables = null;
        this._drawTool.reset();
        this._renderMgr.destroy();
    }

    drawOutline(selected, entity, node) {
    }

    addViewable(viewable) {
        if (!viewable) {
            return;
        }
        var entity = viewable.entity;
        if (entity) {
            this._viewables.set(entity.id, viewable);
        }
    }

    delViewable(viewable) {
        if (!viewable) {
            return;
        }
        var entity = viewable.entity;
        if (entity) {
            this._viewables.delete(entity.id);
            this._picker.delViewable(viewable);
        }
        viewable.destroy();
    }

    lookupViewable(entity) {
        return entity && this._viewables ? this._viewables.get(entity.id) : null;
    }

    onSceneNodeCreated(viewable) {
        this._picker.addViewable(viewable);
    }

    onSceneNodeDestroyed(viewable) {
        this._picker.delViewable(viewable);
    }

    _createContext() {
        let context = {};
        context.containerElement = this._domElement;
        context.clientRect = this._domElement.getBoundingClientRect();
        context.needsRendering = true;
        return context;
    }

    get pivotScale() {
        return 4 / this._context.camera.zoom;
    }

    get pixelScale() {
        return this._zoom * 0.2 / this._context.camera.zoom;
    }

    get dimPreviewFontScale() {
        return 15;
    }

    get domElement() {
        return this._domElement;
    }

    _onSSChanged(e) {
        if (!e) {
            return;
        }

        // for deselection, let render manager know
        //
        var oldEnts = e.old;
        var newEnts = e.new;
        if (!newEnts && oldEnts) {

            var gatherEnts = function (ent, ents) {
                if (!ent) {
                    return null;
                }
                ents.push(ent);
            };

            var ents = [];
            oldEnts.forEach(itr => {
                gatherEnts(itr, ents);
            });

            ents.forEach(itr => {
                this.drawOutline(false, itr, null);
            });
        }

        // show manipulator
        //
        let args = {};
        if (e.selected) {
            let entity = (newEnts && newEnts.length > 0) ? newEnts[0] : null;
            if (!entity) {
                return;
            }

            let viewable = this.lookupViewable(entity);
            if (!viewable || !viewable.movable()) {
                return;
            }
            args.camera = this._context.camera;
            args.domElement = this._context.canvas;
            args.object = viewable;
            args.viewer = this;
            args.blockManipulator = viewable.blockManipulator;
        }
        args.selected = e.selected;
        actionManager.customizeManipulator(args)
        if (!args.selected
            || !(args.blockManipulator && args.blockManipulator === true)) {
            this._showManipulator(args);
        }

        this._showControlPoints(args);
    }

    ray() {
        return this._cameraMgr.getControl().ray();
    }

    updateView() {
        this._cameraMgr.update();
        this._context.needsRendering = true;
    }

    createPreview(type, data) {
        let p = this._creator.createPreview(type, data);
        if (p) {
            this.addViewable(p);
        }
        return p;
    }

    onTransformStarted() {

    }

    onTransformEnded() {

    }

    _showManipulator(args) {
        if (!this._context.isActive) {
            return;
        }

        if (args.object && args.object.hideManipulator()) {
            return;
        }

        if (!args.selected) {
            if (this._cmdTransform) {
                this._cmdTransform.end();
                this._cmdTransform = null;
            }
            return;
        }
        // this._cmdTransform = new TransformCommand(args);
        // this._cmdTransform.execute();
    }

    _showControlPoints(args) {
        if (!this._context.isActive) {
            return;
        }

        if (!args.selected) {
            if (this._controlPoints) {
                this.delViewable(this._controlPoints);
                this._controlPoints = null;
            }

            return;
        }

        if (args.object && args.object.hasControlPoints) {
            this._controlPoints = this._creator.createPreview(PreviewTypes.ControlPoints, { host: args.object });
            this.addViewable(this._controlPoints);
        }
    }

    get controlPoints() {
        return this._controlPoints;
    }

    _setupCamera(context) {
    }

    _onDisplay() {
        if (!this._suspend) {
            this._pendingToFitView = true;
        }
    }

    _onFrameRendered() {
        if (this._pendingToFitView) {
            this.fitScreen();
            this._pendingToFitView = false;
        }
    }

    _setupEvents() {
        EventsManager.instance().listen(Events.ssChanged, this._onSSChanged, this);
        EventsManager.instance().listen(Events.entityAdded, this._onEntityAdded, this);
        EventsManager.instance().listen(Events.entityRemoved, this._onEntityRemoved, this);
        EventsManager.instance().listen(Events.entityPendingToDraw, this._onEntityPendingToDraw, this);
        EventsManager.instance().listen(Events.designClosed, this._onDesignClosed, this);
        EventsManager.instance().listen(Events.designWillClose, this._onDesignWillClose, this);
        EventsManager.instance().listen(Events.designOpened, this._onDesignOpened, this);
        EventsManager.instance().listen(Events.designCreated, this._onDesignCreated, this);
        EventsManager.instance().listen(Events.prodCleared, this._onProdCleared, this);
        EventsManager.instance().listen(Events.frameRendered, this._onFrameRendered, this);
        EventsManager.instance().listen(Events.designReady, this._onDesignReady, this);
        EventsManager.instance().listen(Events.roomNavigated, this._onRoomNavigated, this);
        EventsManager.instance().listen(Events.fitView, this._onDisplay, this);
        EventsManager.instance().listen(Events.projectLoaded, this._onProjectLoaded, this);
    }

    _onProjectLoaded() {
    }

    resize(domId) {
        let domElement = document.getElementById(domId);
        if (!domElement) {
            return;
        }
        this._domElement = domElement;
        this._context.clientRect = this._domElement.getBoundingClientRect();
        let bbox = this._getBoundingBox(this._scene.foreground);
        this._setCameraFrustum(bbox);
        this._renderMgr.onResize(this._context.clientRect);
    }

    _onEntityAdded(entity) {
        if (this._suspend) {
            return;
        }
        if (entity) {
            let viewable = this.lookupViewable(entity);
            if (!viewable) {
                viewable = this._creator.createViewable(entity);
                if (viewable) {
                    this.addViewable(viewable);
                }
            }
        }
    }

    _onEntityRemoved(entity) {
        if (this._suspend) {
            return;
        }
        if (entity) {
            let viewable = this.lookupViewable(entity);
            if (viewable) {
                this.delViewable(viewable);
            }
            this._selector.deselect(entity);
        }
    }

    _onEntityPendingToDraw(entity) {
        if (entity) {
            let viewable = this.lookupViewable(entity);
            if (viewable) {
                viewable.pendingToDraw = true;
            }
        }
    }

    _onRoomNavigated(roomInfo) {
        this.selector.ssClear();
    }

    _getSceneBox() {
    }

    fitScreen() {
        let bbox = null;
        bbox = this._getSceneBox();
        if (!bbox) {
            let s = 3500;
            bbox = new THREE.Box3(new THREE.Vector3(-s, -s, 0), new THREE.Vector3(s, s, 0));
        }
        this._setCameraWithBbox(bbox);
        this._zoom = this._context.camera.zoom * this.pixelLength();
    }

    backupCamera(){
        this._backCamera = {
            cameral: this._context.camera.clone(),
            zoom: this._zoom
        }
        this._cameraMgr.getControl().save();
    }

    restoreCamera(){
        if(this._backCamera){
            this._cameraMgr.getControl().load();
            this._context.camera.copy(this._backCamera.cameral);
            this._zoom = this._backCamera.zoom;
            this._context.needsRendering = true;

            this._backCamera = undefined;
        }
    }

    fitToNode(node) {
        let bbox = this._getBoundingBox(node);
        this._setCameraWithBbox(bbox);
        this._zoom = this._context.camera.zoom * this.pixelLength();
    }

    fitToViewable(viewable) {
        this.fitToNode(viewable.node);
    }

    draw(ents) {
        ents.forEach(itr => {
            itr.dirty = DirtyType.All;
            this._onEntityAdded(itr);
        });

        this._viewables.forEach(itr => {
            itr.createSceneNode();
        });
    }

    _drawEntitiesWithClone(ents, viewid) {
        let arr = [];
        let view = Application.instance().viewers.get(viewid);
        if (!view) {
            return;
        }
        let scene = this._scene.foreground;
        ents.forEach(itr => {
            let viewable = view.lookupViewable(itr);
            if (this._cloneable(viewable, viewid)) {
                let node = viewable.node;
                if (node) {
                    let clone = node.clone();
                    scene.add(clone);
                    arr.push(clone);
                }
            }
        });
        return arr;
    }

    _cloneable(viewable, viewid) {
        if (!viewable) {
            return false;
        }
        if (viewid == '2d') {
            if (viewable.entity.type == entityTypes.Connector) {
                return false;
            }
        }
        return true;
    }

    _getBoundingBox(node) {
        let box = null;
        node.traverse(itr => {
            if (itr.matrixWorldNeedsUpdate) {
                itr.updateMatrixWorld();
            }
            if (itr instanceof THREE.Sprite) {
                return null;
            }

            let geo = itr.geometry;
            if (!geo) {
                return null;
            }
            if (geo.boundingBox) {
                let bbox = geo.boundingBox.clone();
                bbox.applyMatrix4(itr.matrixWorld);
                if (!this._isValidBounding(bbox)) {
                    return null;
                }
                box ? box.union(bbox) : (box = bbox);
            } else {
                let copy = geo.clone();
                copy.applyMatrix4(itr.matrixWorld);
                copy.computeBoundingBox();
                if (!this._isValidBounding(copy.boundingBox)) {
                    return null;
                }
                box ? box.union(copy.boundingBox) : (box = copy.boundingBox);
            }
        });
        return box;
    }

    _isValidBounding(bbox) {
        if (!bbox) {
            return false;
        }
        let max = bbox.max;
        let min = bbox.min;
        if (!max || !min) {
            return false;
        }
        if (isNaN(max.x) || isNaN(max.y) || isNaN(max.z)) {
            return false;
        }
        if (isNaN(min.x) || isNaN(min.y) || isNaN(min.z)) {
            return false;
        }
        return true;
    }

    _setCameraWithBbox(bbox) {
        this._setCameraFrustum(bbox);
    }

    _setCameraFrustum(bbox) {
        let camera = this._context.camera;
        let s = 1;
        let k = 1;
        if (bbox) {
            let min = bbox.min;
            let max = bbox.max;
            s = min.distanceTo(max);
        } else {
            s = 20000;
        }

        if (camera instanceof THREE.OrthographicCamera) {
            camera.zoom = camera.zoom * s / camera.top;
        }

        k = this._context.clientRect.width / this._context.clientRect.height;
        camera.aspect = k;
        camera.left = -s * k;
        camera.right = s * k;
        camera.top = s;
        camera.bottom = -s;

        camera.updateProjectionMatrix();
        this._cameraMgr.getControl().render();
        this._context.needsRendering = true;
    }

    _destroyNodes(nodes) {
        if (!nodes) {
            return;
        }
        let v = new Viewable(this._scene.foreground, this._context, new Entity());
        v.useSharedMaterial = true;
        nodes.forEach(itr => {
            v.destroyNode(itr);
        });
    }

    onEntityShownUp(v) {
        v.displayed = true;
    }

    getPickedRoom(x, y) {
        let s = this.pick({ x: x, y: y });
        let room = null;
        for (let i = 0; i < s.length; i++) {
            let v = s[i].viewable;
            if (v) {
                let ent = v.entity;
                if (ent.type == entityTypes.PolygonRegion && ent.host.host.type == entityTypes.FloorBoard) {
                    room = ent.host.host.room;
                    break;
                }
                else if (ent.type == entityTypes.PolygonRegion && ent.host.host.type == entityTypes.Ceiling) {
                    room = ent.host.host.room;
                    break;
                }
            }
        }
        return room;
    }

    getPickedEntity(x, y, entityType) {
        let s = this.pick({ x: x, y: y });
        let result = null;
        for (let i = 0; i < s.length; i++) {
            let v = s[i].viewable;
            if (v) {
                let ent = v.entity;
                if (ent.type == entityType) {
                    result = s[i];
                    break;
                }
            }
        }
        return result;
    }
}

export { Viewer }