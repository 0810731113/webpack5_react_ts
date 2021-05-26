import * as THREE from 'three'

class SnapManager {
    constructor() {
        this._snaps = [];
    }

    work(pos) {
        let snaps = [];
        this._snaps.forEach(itr => {
            if (itr.snap(pos)) {
                snaps.push(itr);
            }
        });

        let x = pos.x;
        let y = pos.y;
        let binaries = this._getBinaries(snaps);
        let unitaries = this._getUnitaries(snaps);
        let r = [];
        let binary = this._getTop(binaries);
        if (binary) {
            r.push(binary);
            unitaries.forEach(itr => {
                if (itr.snappedPoint.x == binary.snappedPoint.x) {
                    r.push(itr);
                } else if (itr.snappedPoint.y == binary.snappedPoint.y) {
                    r.push(itr);
                }
            });
            x = binary.snappedPoint.x;
            y = binary.snappedPoint.y;
        } else {
            unitaries.forEach(itr => {
                if (itr.snappedPoint.x != null) {
                    x = itr.snappedPoint.x;
                } else if (itr.snappedPoint.y != null) {
                    y = itr.snappedPoint.y;
                }
                r.push(itr);
            });
        }
        return { point: new THREE.Vector3(x, y, 0), snaps: r };
    }

    _getTop(snaps) {
        let p = null;
        let max = -1;
        snaps.forEach (itr => {
            if (itr.priority > max) {
                max = itr.priority;
                p = itr;
            }
        });
        return p;
    }

    _getBinaries(snaps) {
        let arr = [];
        snaps.forEach (itr => {
            if (itr.priority > 0) {
                arr.push(itr);
            }
        });
        return arr;
    }

    _getUnitaries(snaps) {
        let arr = [];
        snaps.forEach (itr => {
            if (itr.priority == 0) {
                arr.push(itr);
            }
        });
        return arr;
    }
}

export { SnapManager }