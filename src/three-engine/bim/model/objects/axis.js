import Entity from '../../../core/model/entity';

class Axis extends Entity {
    constructor(type) {
        super(type);
        this._name = "";
        this._startTagVis = true;
        this._endTagVis = true;
        this._startExt = 0;
        this._endExt = 0;

        this._startElbowLength = 0;
        this._endElbowLength = 0;
        
        this._verticalMin = 0;
        this._verticalMax = 0;

        this._headDiameter = 0;

        this._min = 0;
        this._max = 0;

        this._curve = null;
    }

    get name() {
        return this._name;
    }
    set name(v) {
        this._name = v;
    }

    get startTagVis() {
        return this._startTagVis;
    }
    set startTagVis(v) {
        this._startTagVis = v;
    }

    get endTagVis() {
        return this._endTagVis;
    }
    set endTagVis(v) {
        this._endTagVis = v;
    }

    get startExt() {
        return this._startExt;
    }
    set startExt(v) {
        this._startExt = v;
    }

    get endExt() {
        return this._endExt;
    }
    set endExt(v) {
        this._endExt = v;
    }

    get startElbowLength() {
        return this._startElbowLength;
    }
    set startElbowLength(v) {
        this._startElbowLength = v;
    }

    get endElbowLength() {
        return this._endElbowLength;
    }
    set endElbowLength(v) {
        this._endElbowLength = v;
    }

    get verticalMin() {
        return this._verticalMin;
    }
    set verticalMin(v) {
        this._verticalMin = v;
    }

    get verticalMax() {
        return this._verticalMax;
    }
    set verticalMax(v) {
        this._verticalMax = v;
    }

    get diameter() {
        return this._headDiameter;
    }
    set diameter(v) {
        this._headDiameter = v;
    }

    get min() {
        return this._min;
    }
    set min(v) {
        this._min = v;
    }

    get max() {
        return this._max;
    }
    set max(v) {
        this._max = v;
    }

    get curve() {
        return this._curve;
    }

    movable() {
        return true;
    }

    fromJson(js) {
        super.fromJson(js);
        this.name = js.name;
        this.startTagVis = js.startTagVis;
        this.endTagVis = js.endTagVis;

        let extLength = 3000;
        if (js.ext !== null && js.ext !== undefined)
        {
            extLength = js.ext;
        }
        if (js.startExt !== null && js.startExt !== undefined)
        {
            this.startExt = js.startExt;
        }
        else
        {
            this.startExt = extLength;
        }

        if (js.endExt !== null && js.endExt !== undefined)
        {
            this.endExt = js.endExt;
        }
        else
        {
            this.endExt = extLength;
        }

        this.startElbowLength = js.startElbowLength;
        this.endElbowLength = js.endElbowLength;
        this.verticalMin = js.verticalMin;
        this.verticalMax = js.verticalMax;
        this.diameter = js.diameter;

        this.min = js.min;
        this.max = js.max;
    }

    toJson() {
        let obj = super.toJson();
        return Object.assign(obj, {
            name: this.name,
            startTagVis: this.startTagVis,
            endTagVis: this.endTagVis,
            startExt: this.startExt,
            endExt: this.endExt,
            startElbowLength: this.startElbowLength,
            endElbowLength: this.endElbowLength,
            verticalMin: this.verticalMin,
            verticalMax: this.verticalMax,
            diameter: this.diameter,
            min: this._min,
            max: this._max,
            curve: this._curve ? this._curve.toJson() : null
        });
    }
}

export { Axis }