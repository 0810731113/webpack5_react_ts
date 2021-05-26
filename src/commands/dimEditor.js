class DimEditor {
    constructor(domElement) {
        this._canvasNode = domElement;
        this._input = document.createElement('input');
        this._input.className = 'anno-input';
        this._input.tabIndex = 0;
        this._input.disabled = false;
        if (domElement) {
            this._canvasNode.appendChild(this._input);
        }
        this._input.width = this.length;
        this._prevText = null;
        this._angle = 0;
    }

    get length() {
        return 50;
    }

    setRotation(angle) {
        let isFocus = document.activeElement === this._input;
        this._angle = angle;
        if (!isFocus) {
            let val = 'rotate(' + angle + 'deg)';
            this._input.style.transform = val;
        }
    }

    setPosition(x, y) {
        let style = this._input.style;
        x -= this.length / 2;
        y -= 10;

        let maxX = this._canvasNode.clientWidth - this.length/2;
        let maxY = this._canvasNode.clientHeight - 10;

        style.display = 'block';
        style.left = x > maxX ? maxX : x + 'px';
        style.top = y > maxY ? maxY : y + 'px';
    }

    setDisable(bol) {
        this._input.disabled = bol;
    }

    fillText(text) {
        //this._prevText = this._input.value;
        this._input.value = text;
        this._prevText = text;
        this._input.focus();
    }

    resetVal() {
        if (this._input) {
            this._input.value = this._prevText;
        }
    }

    commitVal(e, cb) {
        let value = parseInt(e.target.value);

        if (value !== parseInt(this._prevText)) {
            if (value >= 0) {
                if (!cb(value)) {
                    this.resetVal();
                    alert('out of range');
                }
            } else {
                this.resetVal();
                alert('error input')
            }
        }
    }

    setCallback(cb) {

        this._input.onkeydown = (e) => {
            if (e.keyCode !== 27) { //esc
                e.stopPropagation()
            }
        };

        this._input.onkeyup = (e) => {
            if (e.keyCode !== 27) { //esc
                e.stopPropagation()
            }
        };

        this._input.onfocus = (e) => {
            this._input.select();
            this._input.style.transform = 'rotate(0deg)';
        };

        //   this._input.onblur = (e) => {
        //       this.setRotation(this._angle);
        //       this.commitVal(e, cb)
        //   }

        this._input.onkeypress = (e) => {

            if (e.keyCode === 13) { //enter
                this.commitVal(e, cb)
            }
        }
    }

    destroy() {
        if (!this._input) {
            return;
        }
        this._canvasNode.removeChild(this._input);
        this._input = null;
    }
}


function setFocusFirstEditor() {

    let editors = document.getElementsByClassName('anno-input');
    if (editors && editors[0]) {
        editors[0].focus();
    }
}

export { DimEditor, setFocusFirstEditor }