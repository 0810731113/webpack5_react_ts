import actionManager from "../actions/actionmanager";
import { Application } from "../application";
import { DeleteCommand } from "../commands/deletecommand";

class Handler {
  constructor(viewer) {
    this._isMouseDown = false;
    this._isDragging = false;
    this._isMoving = false;
    this._downEvent = null;
    this._viewer = viewer;
    this._hoverTarget = null;
  }

  get isMouseDown() {
    return this._isMouseDown;
  }

  set isMouseDown(p) {
    this._isMouseDown = p;
  }

  get isDragging() {
    return this._isDragging;
  }

  set isDragging(p) {
    this._isDragging = p;
  }

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(p) {
    this._isMoving = p;
  }

  get downEvent() {
    return this._downEvent;
  }

  set downEvent(p) {
    this._downEvent = p;
  }

  onMousedown(e, info) {
    if (info && info.infos) {
      this._isMouseDown = true;
      let top = this.getTopInfo(info);
      let viewable = top.viewable;
      viewable.controller.onmousedown(e, top);
    }
  }

  onMouseup(e, info) {
    if (info && info.infos) {
      let top = this.getTopInfo(info);
      let viewable = top.viewable;
      viewable.controller.onmouseup(e, top);
    }

    // tell viewable controller that mouse right-click happening
    //
    if (this._dragViewable) {
      this._dragViewable.controller.onRightClick(e);
    }
    this._dragViewable = null;
    this._dragHitPoint = null;
  }

  onMousemove(e, info) {
    let preview = this.getPreview(info);
    if (preview) {
      let viewable = preview.viewable;
      viewable.controller.onmousein(e, preview);
      this._preview = preview;
      return;
    } else if (this._preview) {
      this._preview.viewable.controller.onmouseout(e, this._preview);
      this._preview = null;
      return;
    }

    let currentHove = null;
    if (info) {
      currentHove = this.getTopInfo(info);
    }

    if (this._hoverTarget) {
      if (
        currentHove != null &&
        this._hoverTarget.viewable == currentHove.viewable &&
        currentHove.viewable != undefined
      ) {
        let c = this._hoverTarget.viewable.controller;
        if (c) {
          c.onhovermove(e, this._hoverTarget);
        }
        return;
      } else {
        let c = this._hoverTarget.viewable.controller;
        if (c) {
          c.onhoverend(e, this._hoverTarget);
          this._hoverTarget = null;
        }
      }
    }

    if (currentHove) {
      currentHove.viewable.controller.onhoverstart(e, currentHove);
      this._hoverTarget = currentHove;
    }
  }

  onMouseout(e) {
    if (this._hoverTarget) {
      let c = this._hoverTarget.viewable.controller;
      if (c) {
        c.onhoverend(e, this._hoverTarget);
        this._hoverTarget = null;
      }
    }
  }

  onDragstart(e, info) {
    if (!info) {
      return;
    }
    if (e.button == 2) {
      return;
    }
    let top = this.getTopInfo(info);
    if (!this.isPreview(top) && this._preview) {
      top = this._preview;
    }
    this._isDragging = true;
    this._dragViewable = top.viewable;
    this._dragHitPoint = top.point;
    this._dragViewable.controller.onDragstart(e, top);
  }

  onDragend(e, info) {
    if (e.button == 2) {
      this._isDragging = false;
      return;
    }
    if (!this._dragViewable || !this._dragHitPoint) {
      return;
    }
    this._dragViewable.controller.onDragend(e, info);
    this._dragViewable = null;
    this._dragHitPoint = null;
  }

  onDragmove(e, info) {
    if (e.button == 2) {
      return;
    }
    if (!this._dragViewable || !this._dragHitPoint) {
      return;
    }
    this._dragViewable.controller.onDragmove(e, info);
  }

  onClick(e, info) {
    let picked = this.getPicked(e);
    if (picked && picked.infos) {
      if (this._preview) {
        return;
      }
      let top = this.getTopInfo(picked);
      let viewable = top.viewable;
      viewable.controller.onClick(e, top);
    } else {
      if (!this._isDragging) {
        this._viewer.selector.ssClear();
      }
    }
  }

  ondblclick(e) {
    let picked = this.getPicked(e);
    if (picked && picked.infos) {
      if (this._preview) {
        return;
      }
      let top = this.getTopInfo(picked);
      let viewable = top.viewable;
      viewable.controller.onDblClick(e, top);
    }
  }

  onKeyup(e) {
    // '8': backspace for mac, '46': delete
    //
    if (e.keyCode == 8 || e.keyCode == 46) {
      let deleteCmd = new DeleteCommand();
      actionManager.processCommand(deleteCmd);
    } else {
      let activeView = Application.instance().getActiveView();
      let sEnt = activeView.selector.ssEnts.values().next();
      if (sEnt) {
        let entity = sEnt.value;
        if (entity) {
          let viewable = entity.param.viewable;
          //@ts-nocheck
          viewable.controller.onKeyup(e, top);
        }
      }
    }
  }

  onKeydown(e) {
    //keyCode z==90, y==89, s==83
    if (e.ctrlKey && e.keyCode == 90) {
      actionManager.reset();
    } else if (e.ctrlKey && e.keyCode == 89) {
      actionManager.reset();
    } else if (e.ctrlKey && e.keyCode == 83) {
      e.preventDefault();
    } else if (e.ctrlKey == true && e.keyCode == 67) {
      console.log("no support");
    } else if (!e.ctrlKey) {
      let activeView = Application.instance().getActiveView();
      let sEnt = activeView.selector.ssEnts.values().next();
      if (sEnt) {
        let entity = sEnt.value;
        if (entity) {
          let viewable = entity.param.viewable;
          viewable.controller.onKeydown(e, top);
        }
      }
    }
  }

  posChanged(e) {
    if (!this._downEvent) return false;
    return (
      Math.abs(this._downEvent.screenX - e.screenX) > 1 ||
      Math.abs(this._downEvent.screenY - e.screenY) > 1
    );
  }

  getPicked(e) {
    let result = this.pick(e, actionManager.pickFilter);

    const infos = result.infos;
    if (infos.length == 0) {
      return;
    }
    return result;
  }

  pick(e, filter) {
    let ptScreen = {};
    ptScreen.x = e.clientX;
    ptScreen.y = e.clientY;
    let infos = this._viewer.pick(ptScreen, filter);
    let result = {};
    result.event = e;
    result.infos = infos;
    return result;
  }

  getTopInfo(info) {
    if (!info || !info.infos) {
      return null;
    }
    let top = null;
    let arr = info.infos;
    for (let i = 0; i < arr.length; i++) {
      let itr = arr[i];
      if (itr.viewable.isPreview()) {
        top = itr;
        break;
      }
    }

    if (!top && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let itr = arr[i];
        if (!itr.viewable.selectionLowerPrioity()) {
          top = itr;
          break;
        }
      }

      let p = this._getTopDisplay(arr);
      if (p && p.viewable.ssLevel > top.viewable.ssLevel) {
        if (Math.abs(p.dist - top.dist) < 0.1) {
          top = p;
        }
      }
    }

    if (!top && arr.length > 0) {
      top = arr[0];
    }
    return top;
  }

  isPreview(top) {
    if (!top) {
      return false;
    }

    let viewable = top.viewable;
    if (!viewable) {
      return false;
    }

    return viewable.isPreview();
  }

  getPreview(info) {
    let top = this.getTopInfo(info);
    return this.isPreview(top) ? top : null;
  }

  _getTopDisplay(arr) {
    let p = null;
    let max = 0;
    arr.forEach((itr) => {
      let level = itr.viewable.ssLevel;
      if (level > max) {
        p = itr;
        max = level;
      }
    });
    return p;
  }
}

export { Handler };
