import actionManager from '../actions/actionmanager';
import { Handler } from './handler';

class Interactor {

    constructor(viewer) {
        this._viewer = viewer;
        this._preview = null;
        this._eventMap = new Map();
        this._handler = new Handler(viewer);
        this._startPickInfo = null;
    }

    get handler() {
        return this._handler;
    }

    registerEvents() {
        this.unregisterEvents();
        actionManager.currentView = this._viewer;
        let canvas = this._viewer.canvas;
        if (canvas) {

            // mouse events
            //
            const mouseDownListener = this.onmousedown.bind(this);
            canvas.addEventListener('mousedown', mouseDownListener);
            this._eventMap.set('mousedown', [canvas, mouseDownListener]);
            const mouseUpListener = this.onmouseup.bind(this);
            canvas.addEventListener('mouseup', mouseUpListener);
            this._eventMap.set('mouseup', [canvas, mouseUpListener]);
            const mouseMoveListener = this.onmousemove.bind(this);
            canvas.addEventListener('mousemove', mouseMoveListener);
            this._eventMap.set('mousemove', [canvas, mouseMoveListener]);
            const mouseOutListener = this.onmouseout.bind(this);
            canvas.addEventListener('mouseleave', mouseOutListener);
            this._eventMap.set('mouseout', [canvas, mouseOutListener]);
            const mouseClickListener = this.onclick.bind(this);
            canvas.addEventListener('click', mouseClickListener);
            this._eventMap.set('click', [canvas, mouseClickListener]);
            const mouseDblClickListener = this.ondblclick.bind(this);
            canvas.addEventListener('dblclick', mouseDblClickListener);
            this._eventMap.set('dblclick', [canvas, mouseDblClickListener]);

            // keyboard events
            //
            const keyDownListener = this.onkeydown.bind(this);
            window.addEventListener('keydown', keyDownListener);
            this._eventMap.set('keydown', [window, keyDownListener]);
            const keyUpListener = this.onkeyup.bind(this);
            window.addEventListener('keyup', keyUpListener);
            this._eventMap.set('keyup', [window, keyUpListener]); 

            // drag events
            //
            const dragOverListener = this.ondragover.bind(this);
            window.addEventListener('dragover', dragOverListener);
            this._eventMap.set('dragover', [window, dragOverListener]);
            const dropListener = this.ondrop.bind(this);
            document.addEventListener('drop', dropListener);
            this._eventMap.set('drop', [document, dropListener]);
        }
    }

    unregisterEvents() {
        if (!this._eventMap) {
            return;
        }
        this._eventMap.forEach((v, k) => {
            v[0].removeEventListener(k, v[1]);
        });
        this._eventMap.clear();
        actionManager.currentView = undefined;
    }

    destroy() {
        this.unregisterEvents();
    }

    ondblclick(e) {
        if (actionManager.blockingEvents(e)) {
            return;
        }
        this.handler.ondblclick(e);
    }

    onclick(e) {
        if (actionManager.blockingEvents(e)) {
            return;
        }
        
        if (!this.handler.isDragging) {
            this.handler.onClick(e);
        }
        this.handler.isDragging = false;
    }

    onkeydown(e) {
        if (this._viewer.type !== 'navigator') {
            actionManager.onKeyDown(e);
            this._handler.onKeydown(e);
        }
    }

    onkeyup(e) {
        if (this._viewer.type !== 'navigator') {
            actionManager.onKeyUp(e);
            this._handler.onKeyup(e);
        }
    }

    onmousedown(e) {
        actionManager.onMouseDown(e);
        if (actionManager.blockingEvents(e)) {
            return;
        }
        this._startPickInfo = this.handler.getPicked(e);
        this.handler.isMouseDown = true;
        this.handler.downEvent = e;
        this.handler.onMousedown(e, this._startPickInfo);
    }

    onmouseup(e) {
        actionManager.onMouseUp(e);
        if (actionManager.blockingEvents(e)) {
            return;
        }
        
        let info = this.handler.getPicked(e);
        if (this.handler.isDragging && this.handler.posChanged(e)) {
            this.handler.onDragmove(e, info);
            return this.ondragend(e);
        }

        this.handler.isMouseDown = false;
        this.handler.onMouseup(e, info);
        this.handler.downEvent = null;
        this._startPickInfo = null;
    }

    onmousemove(e) {
        actionManager.onMouseMove(e);
        if (actionManager.blockingEvents(e)) {
            return;
        }

        let info = this.handler.getPicked(e);
        if (this.handler.isDragging) {
            return this.handler.onDragmove(e, info);
        }

        if (!this.handler.isDragging && this.handler.isMouseDown && this.handler.posChanged(e)) {
            this.handler.isDragging = true;
            this.handler.onDragstart(this.handler.downEvent || e,  this._startPickInfo ? this._startPickInfo : info);
            return this.handler.onDragmove(e, info);
        }
        return this.handler.onMousemove(e, info);
    }

    onmouseout(e){
        actionManager.onMouseOut(e);
        if (actionManager.blockingEvents(e)) {
            return;
        }

        return this.handler.onMouseout(e);
    }

    ondragover(e) {
        if (this._viewer.type !== 'navigator') {
            actionManager.onDragOver(e);
        }
    }

    ondrop(e) {
        if (this._viewer.type !== 'navigator') {
            actionManager.onDrop(e);
        }
    }

    ondragstart(e) {
        if (this.handler.isDragging) return;

        let info = this.handler.getPicked(e);
        if (!this.handler.isMouseDown) {
            this.handler.isMouseDown = true;
            return this.handler.onMousedown(e, info);
        }

        this.handler.isDragging = true;
        return this.handler.onDragstart(e, info);
    }

    ondragend(e) {
        let info = this.handler.getPicked(e);
        if (this.handler.isDragging) {
            this.handler.onDragend(e, info);
        }

        if (this.handler.isMouseDown) {
            this.handler.isMouseDown = false;
            this.handler.onMouseup(e, info);
        }

        this.handler.downEvent = undefined;
    }

    ondragmove(e) {
        if (!this.handler.isMouseDown) return;

        let info = this.handler.getPicked(e);
        if (!this.handler.isDragging) {
            this.handler.isDragging = true;
            this.handler.onDragstart(this.handler.downEvent || e, info);
        }
        return this.handler.onDragmove(e, info);
    }
}

export { Interactor }