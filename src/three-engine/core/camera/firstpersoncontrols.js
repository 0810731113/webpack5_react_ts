import * as THREE from 'three'
class FirstPersonControls {
    constructor(object, domElement, context, host) {
        this.context = context;
        this.object = object;
        this.target = new THREE.Vector3(0, 0, 0);
        this.domElement = (domElement !== undefined) ? domElement : document;
        this.enabled = true;
        this.movementSpeed = 1000.0;
        this.lookSpeed = 0.005;
        this.lookVertical = true;
        this.autoForward = false;
        this.activeLook = true;
        this.heightSpeed = false;
        this.heightCoef = 1.0;
        this.heightMin = 0.0;
        this.heightMax = 1.0;
        this.constrainVertical = false;
        this.verticalMin = 0;
        this.verticalMax = Math.PI;
        this.autoSpeedFactor = 0.0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lat = 0;
        this.lon = 0;
        this.phi = 0;
        this.theta = 0;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.mouseDragOn = false;
        this.viewHalfX = 0;
        this.viewHalfY = 0;
        this.panOffset = new THREE.Vector3();
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();
        this.needUpdate = false;
        this.enableKeys = true;
        this.host = host;
        this.processing = false;
        if (this.domElement !== document) {
            this.domElement.setAttribute('tabindex', - 1);
        }
        this._init();
    }

    handleResize() {
        if (this.domElement === document) {
            this.viewHalfX = window.innerWidth / 2;
            this.viewHalfY = window.innerHeight / 2;
        } else {
            this.viewHalfX = this.domElement.offsetWidth / 2;
            this.viewHalfY = this.domElement.offsetHeight / 2;
        }
    }

    panLeft(distance, objectMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(- distance);
        this.panOffset.add(v);
    }

    panUp(distance, objectMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 1);
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }

    pan(deltaX, deltaY) {
        let offset = new THREE.Vector3();
        let element = this.domElement === document ? this.domElement.body : this.domElement;
        if (this.object.isPerspectiveCamera) {
            let position = this.object.position;
            offset.copy(position).sub(this.target);
            let targetDistance = offset.length();
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
            this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
            this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
        } else if (this.object.isOrthographicCamera) {
            this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
            this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            this.enablePan = false;
        }
    }

    handleMouseDownPan(event) {
        this.host.onChangeStart();
        this.panStart.set(event.clientX, event.clientY);
    }

    handleMouseMovePan(event) {
        this.panEnd.set(event.clientX, event.clientY);
        this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(3);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panStart.copy(this.panEnd);
        this.target.add(this.panOffset);
        this.object.lookAt(this.target);
        this.object.updateProjectionMatrix();
        this.context.needsRendering = true;
        this.panOffset.set(0, 0, 0);
    }

    changeTarget(x, y, z) {
        this.target = new THREE.Vector3(x, y, z);
        this.object.lookAt(this.target);
    }

    update(delta) {
        if (this.enabled === false || !this.needUpdate) {
            return;
        }

        let offset = delta * 10000;
        if (this.moveForward) this.translatePosition(offset, false);
        if (this.moveBackward) this.translatePosition(-offset, false);
        if (this.moveLeft) this.translatePosition(offset, true);
        if (this.moveRight) this.translatePosition(-offset, true);
        if (this.moveUp) this.object.position.z += offset;
        if (this.moveDown) this.object.position.z += -offset;
    }

    translatePosition(offset, vertical) {
        let pos = this.object.position;
        let target = this.target.clone();
        let ray = target.sub(pos);
        ray.z = 0;
        ray.normalize();
        if (vertical) {
            let angle = Math.PI / 2;
            let R = new THREE.Matrix4();
            let quat = new THREE.Quaternion();
            quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
            R.makeRotationFromQuaternion(quat);
            ray.applyMatrix4(R);
            ray.normalize();
        }
        let delta = ray.multiplyScalar(offset);
        this.object.position.add(delta);
        this.target.add(delta);
    }

    handleMouseUp(event) {
        this.host.onChangeEnd();
    }

    onMouseDown(event) {
        if (!this.enabled) {
            return;
        }
        this.mouseDragOn = true;
        this.handleMouseDownPan(event);
    }

    onMouseUp(event) {
        if (!this.enabled) {
            return;
        }
        this.mouseDragOn = false;
        this.handleMouseUp(event);
    }

    onMouseMove(event) {
        if (!this.enabled) {
            return;
        }
        if (!this.mouseDragOn || event.buttons === 0) {
            return;
        }
        this.handleMouseMovePan(event);
    }

    onKeyDown(event) {
        if (!this.enableKeys) {
            return;
        }

        switch (event.keyCode) {
            case 38: /*up*/
            case 87: /*W*/ this.moveForward = true;
                this.needUpdate = true;
                break;
            case 37: /*left*/
            case 65: /*A*/ this.moveLeft = true;
                this.needUpdate = true;
                break;
            case 40: /*down*/
            case 83: /*S*/ this.moveBackward = true;
                this.needUpdate = true;
                break;
            case 39: /*right*/
            case 68: /*D*/ this.moveRight = true;
                this.needUpdate = true;
                break;
            case 81: /*Q*/ this.moveUp = true;
                this.needUpdate = true;
                break;
            case 69: /*E*/ this.moveDown = true;
                this.needUpdate = true;
                break;
        }
        if (this.host) {
            this.host.startClock();
            if (this.needUpdate) {
                this.host.onChangeStart();
            }
        }
        this.context.needsRendering = true;
    }

    onKeyUp(event) {
        if (!this.enableKeys) {
            return;
        }
        
        switch (event.keyCode) {
            case 38: /*up*/
            case 87: /*W*/ this.moveForward = false;
                break;
            case 37: /*left*/
            case 65: /*A*/ this.moveLeft = false;
                break;
            case 40: /*down*/
            case 83: /*S*/ this.moveBackward = false;
                break;
            case 39: /*right*/
            case 68: /*D*/ this.moveRight = false;
                break;
            case 81: /*Q*/ this.moveUp = false;
                break;
            case 69: /*E*/ this.moveDown = false;
                break;
        }
        if (this.host) {
            this.host.startClock();
            this.host.onChangeEnd();
        }
        this.needUpdate = false;
        this.context.needsRendering = true;
    }

    onMouseWheel(event) {
        this._onMouseWheelBegin(event);
        setTimeout(() => {
            this._onMouseWheelEnd();
        }, 250);
    }

    _onMouseWheelBegin(event) {
        setTimeout(() => {
            this._onMouseWheeling(event);
        }, 0.1);
    }

    _onMouseWheeling(event) {
        if (event.wheelDelta > 0) {
            this.moveForward = true;
        } else {
            this.moveBackward = true;
        }
        if (this.host) {
            this.host.startClock();
            this.host.onChangeStart();
        }
        this.needUpdate = true;
        this.context.needsRendering = true;
    }

    _onMouseWheelEnd() {
        this.moveForward = false;
        this.moveBackward = false;
        if (this.host) {
            this.host.startClock();
            this.host.onChangeEnd();
        }
        this.needUpdate = false;
        this.context.needsRendering = true;
    }

    contextmenu(event) {
        event.preventDefault();
    }

    dispose() {
        this.domElement.removeEventListener('contextmenu', this.contextmenu, false);
        this.domElement.removeEventListener('mousedown', this._onMouseDown, false);
        this.domElement.removeEventListener('mousemove', this._onMouseMove, false);
        this.domElement.removeEventListener('mouseup', this._onMouseUp, false);
        this.domElement.removeEventListener('wheel', this._onMouseWheel, false);
        this.domElement.removeEventListener('keydown', this._onKeyDown, false);
        this.domElement.removeEventListener('keyup', this._onKeyUp, false);
    }

    bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    }

    _init() {
        this._onMouseMove = this.bind(this, this.onMouseMove);
        this._onMouseDown = this.bind(this, this.onMouseDown);
        this._onMouseUp = this.bind(this, this.onMouseUp);
        this._onMouseWheel = this.bind(this, this.onMouseWheel);
        this._onKeyDown = this.bind(this, this.onKeyDown);
        this._onKeyUp = this.bind(this, this.onKeyUp);
        this.domElement.addEventListener('contextmenu', this.contextmenu, false);
        this.domElement.addEventListener('mousemove', this._onMouseMove, false);
        this.domElement.addEventListener('mousedown', this._onMouseDown, false);
        this.domElement.addEventListener('mouseup', this._onMouseUp, false);
        this.domElement.addEventListener('wheel', this._onMouseWheel, false);
        this.domElement.addEventListener('keydown', this._onKeyDown, false);
        this.domElement.addEventListener('keyup', this._onKeyUp, false);
        this.handleResize();
    }
}

export { FirstPersonControls }