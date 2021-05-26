import * as THREE from 'three'
import { ColorSchemeDefs } from '../colorscheme/def';
import { Application } from '../../../core/application';

class Global {
    constructor() {
        this._defaultHLMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff, transparent: false });
        this._defaultSSMaterial = new THREE.MeshLambertMaterial({color: 0xffff00 });
        this._pivotGeometry = new THREE.CircleGeometry(50, 256);
        this._pivotMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
        this._pivotHLMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
        this._pivotSSMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
        this._wallEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        this._wallRegionMaterial = new THREE.MeshBasicMaterial({ color: 0x777777, transparent: false });
        this._wallRegionMaterial_BEARING = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: false });
        this._wallRegionMaterial_PARAPET = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: false });
        this._wallRegionHLMaterial = this._defaultHLMaterial;
        this._wallRegionSSMaterial = this._defaultSSMaterial;
        this._roomMaterial = new THREE.MeshBasicMaterial({ color: 0xD9D9D9, transparent: false, opacity: 1.0 });
        this._roomTopMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
        this._roomHLMaterial =  new THREE.MeshBasicMaterial({ color: 0xFFF18E, transparent: false, opacity: 1.0  });
        this._roomSSMaterial = new THREE.MeshBasicMaterial({ color: 0x5E9BFF, transparent: false, opacity: 1.0  });
        this._openingLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 100 });
        this._openingRegionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent:false, opacity: 1.0, side: THREE.DoubleSide });
        this._openingDashedLineMaterial = new THREE.LineDashedMaterial({ color: 0x000000, linewidth: 100, gapSize:60, dashSize:40 });
        this._lampRelationMaterial1 = new THREE.LineDashedMaterial({ color: 0xff0000, linewidth: 200, gapSize:60, dashSize:40 });
        this._lampRelationMaterial2 = new THREE.LineDashedMaterial({ color: 0xff0000, linewidth: 200, gapSize:60, dashSize:40 });
        this._lampRelationMaterial0 = new THREE.LineDashedMaterial({ color: 0xff0000, linewidth: 200, gapSize:60, dashSize:40 });
        this._dim2dMaterial = new THREE.LineBasicMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.5 });
        this._fontFillMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        this._fontEdgeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false});
        this._viewCullingEnabled = false;
        this._wallTrspEnabled=false;
    }

    get defaultHLMaterial() {
        return this._defaultHLMaterial;
    }

    get defaultSSMaterial() {
        return this._defaultSSMaterial;
    }

    get viewCullingEnabled() {
        return this._viewCullingEnabled;
    }

    set viewCullingEnabled(p) {
        this._viewCullingEnabled = p;
    }

    get wallTrspEnabled() {
        return this._wallTrspEnabled;
    }

    set wallTrspEnabled(p) {
        this._wallTrspEnabled = p;
    }

    get modularRoomSize() {
        return { x: 6000, y: 5000, thickness: 200 };
    }

    get minDimGap() {
        return 300;
    }

    get pivotGeometry() {
        return this._pivotGeometry;
    }

    get pivotMaterial() {
        return this._applyColorScheme(this._pivotMaterial, ColorSchemeDefs.WALL2d_CONNECTOR);
    }

    get pivotHLMaterial() {
        return this._pivotHLMaterial;
    }

    get pivotSSMaterial() {
        return this._pivotSSMaterial;
    }

    get wallEdgeMaterial() {
        return this._applyColorScheme(this._wallEdgeMaterial, ColorSchemeDefs.WALL2d_EDGE);
    }

    get wallRegionMaterial() {
        return this._applyColorScheme(this._wallRegionMaterial, ColorSchemeDefs.WALL2d_NORMAL);
    }

    get wallRegionMaterial_BEARING() {
        return this._applyColorScheme(this._wallRegionMaterial_BEARING, ColorSchemeDefs.WALL2d_BEARING);
    }

    get wallRegionMaterial_PARAPET() {
        return this._applyColorScheme(this._wallRegionMaterial_PARAPET, ColorSchemeDefs.WALL2d_PARAPET);
    }

    get wallRegionHLMaterial() {
        return this._wallRegionHLMaterial;
    }

    get wallRegionSSMaterial() {
        return this._wallRegionSSMaterial;
    }

    get roomMaterial() {
        return this._roomMaterial;
    }

    get roomTopMaterial() {
        return this._roomTopMaterial;
    }

    get roomHLMaterial() {
        return this._roomHLMaterial;
    }

    get roomSSMaterial() {
        return this._roomSSMaterial;
    }

    get openingLineMaterial(){
        return this._applyColorScheme(this._openingLineMaterial, ColorSchemeDefs.OPENING2d_EDGE);
    }

    get openingRegionMaterial(){
        return this._applyColorScheme(this._openingRegionMaterial, ColorSchemeDefs.OPENING2d_FILL);
    }

    get openingDashedLineMaterial(){
        return this._applyColorScheme(this._openingDashedLineMaterial, ColorSchemeDefs.OPENING2d_EDGE);
    }

    get dim2dMaterial() {
        return this._applyColorScheme(this._dim2dMaterial, ColorSchemeDefs.DIM2d_LINE);
    }

    get fontFillMaterial() {
        return this._applyColorScheme(this._fontFillMaterial, ColorSchemeDefs.FONT2d_FILL);
    }

    get fontEdgeMaterial() {
        return this._applyColorScheme(this._fontEdgeMaterial, ColorSchemeDefs.FONT2d_EDGE);
    }

    _applyColorScheme(mat, id) {
        let data = Application.instance().colorSchemeMgr.scheme.lookup(id);
        if (data) {
            mat.color = new THREE.Color(data.color);
            mat.opacity = data.opa;
        }
        return mat;
    }
}

export { Global }