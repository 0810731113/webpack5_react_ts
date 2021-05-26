import * as THREE from 'three'
import { DrawTool } from './drawtool';
import materialUtils from '../materialUtils';
import { Application } from '../../application';

class ThreeDrawTool extends DrawTool {
    constructor() {
        super();
        this._clonedTextureMaps = new Map();
    }

    createMesh(meshData) {
        if (!meshData) {
            return undefined;
        }

        if (meshData.triangles.length === 0 && meshData.vertices.length === 0 && meshData.normals.length === 0) {
            return undefined;
        }

        if (meshData.vertices.length / 3 != meshData.uvs.length / 2) {
            this._convertMeshData(meshData);
        }
        const buffer = new THREE.BufferGeometry();
        if (meshData.triangles.length !== 0) {
            buffer.setIndex(meshData.triangles, 1);
        }
        buffer.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
        buffer.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
        buffer.setAttribute('uv', new THREE.Float32BufferAttribute(meshData.uvs ? meshData.uvs : [], 2));
        const material = new THREE.MeshPhongMaterial({ flatShading: true });
        material.side = THREE.DoubleSide;
        return new THREE.Mesh(buffer, material);
    }

    editMesh(meshNode, meshData) {
        if (meshNode === undefined ||
            meshNode.geometry === undefined ||
            meshData === undefined ||
            meshData.triangles === undefined ||
            meshData.vertices === undefined ||
            meshData.normals === undefined) {
            return false;
        } else {
            this._convertMeshData(meshData);
            meshNode.geometry.setIndex(meshData.triangles);
            meshNode.geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.vertices, 3));
            meshNode.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.normals, 3));
            meshNode.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(meshData.uvs ? meshData.uvs : [], 2));
            return true;
        }
    }

    _convertMeshData(meshData) {
        const vertices = meshData.vertices;
        const triangles = [];
        const positions = [];
        for (let i = 0; i < meshData.triangles.length; i++) {
            let idx = meshData.triangles[i] * 3;
            positions.push(vertices[idx]);
            positions.push(vertices[idx + 1]);
            positions.push(vertices[idx + 2]);
            triangles.push(i);
        }
        meshData.vertices = positions;
        meshData.triangles = triangles;
    }

    createArrow(p, d, color) {
        let arrow = new THREE.ArrowHelper(d, p, 10, color);
        return arrow;
    }
    createLine(data, material) {
        let v = data.vertices;
        let geo = new THREE.Geometry();
        for (let i = 0; i + 2 < v.length; i += 3) {
            geo.vertices.push(new THREE.Vector3(v[i], v[i + 1], v[i + 2]));
        }
        return this.makeLine(geo, material);
    }

    createDashedLine(data, material) {
        let v = data.vertices;
        let p1 = new THREE.Vector3(v[0], v[1], v[2]);
        let p2 = new THREE.Vector3(v[3], v[4], v[5]);
        let geo = new THREE.Geometry();
        geo.vertices.push(p1);
        geo.vertices.push(p2);
        const line = this.makeLine(geo, material);
        line.computeLineDistances();
        return line;
    }

    createDottedLineWith2Points(start, end, color) {

        let mat = new THREE.LineDashedMaterial({ color: color, linewidth: 1, scale: 1, dashSize: 2, gapSize: 2, });
        let geo = new THREE.Geometry();
        geo.vertices.push(start);
        geo.vertices.push(end);
        const line = this.makeLine(geo, mat);
        line.computeLineDistances();
        return line;
    }

    createDottedLineWith2PointsWithArrow(start, end, color, scene) {

        let mat = new THREE.LineDashedMaterial({ color: color, linewidth: 1, scale: 1, dashSize: 3, gapSize: 1, });
        let geo = new THREE.Geometry();
        geo.vertices.push(start);
        geo.vertices.push(end);
        const line = this.makeLine(geo, mat);
        line.computeLineDistances();


        var direction = end.clone().sub(start);
        var length = direction.length();
        var arrowHelper = new THREE.ArrowHelper(direction.normalize(), start, length, 'red');
        var arrowHelper2 = new THREE.ArrowHelper(direction.normalize(), end, length, 'red');
        scene.add(arrowHelper);
        scene.add(arrowHelper2);
        return line;
    }

    createSplineLine(verticesArray, material) {
        let curve = new THREE.CatmullRomCurve3(verticesArray);
        let points = curve.getPoints(30);
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let curveObject = new THREE.Line(geometry, material);
        return curveObject;
    }

    createEllipseLine(center, xRadius, yRadius, startDegree, endDegree, clockwise, material, z) {
        var curve = new THREE.EllipseCurve(
            center.x, center.y,            // ax, aY
            xRadius, yRadius,           // xRadius, yRadius
            startDegree, endDegree,  // aStartAngle, aEndAngle
            clockwise,            // aClockwise
            0                 // aRotation
        );

        var points = curve.getPoints(50);

        points.forEach(r => { r.z = z });

        var geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        var ellipse = new THREE.Line(geometry, material);

        return ellipse;
    }

    drawDebugLine(curve) {
        let geometry = new THREE.Geometry();
        geometry.vertices.push(curve.startPnt); //x, y, z
        geometry.vertices.push(curve.endPnt);
        /* linewidth on windows will always be 1 */
        let material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 5
        });
        let line = new THREE.Line(geometry, material);
        let viewer = Application.instance().viewers.get('3d');
        viewer.scene().add(line);
    }

    createLineWith2Points(start, end, material) {
        let geo = new THREE.Geometry();
        geo.vertices.push(start);
        geo.vertices.push(end);
        return this.makeLine(geo, material);
    }

    createShapeByPolygon(polygon) {
        let shape = null;
        if (polygon.outerBoundary.length >= 3) {
            shape = new THREE.Shape(polygon.outerBoundary);

            polygon.holes.forEach(polyHole => {
                let hole = new THREE.Path(polyHole);
                shape.holes.push(hole);
            });
        }
        return shape;
    }

    createShape(pnts) {
        let shape = null;
        let len = pnts.length;
        if (len >= 3) {
            shape = new THREE.Shape();
            shape.moveTo(pnts[0].x, pnts[0].y);
            for (let i = 1; i < len; i++) {
                let v = pnts[i];
                shape.lineTo(v.x, v.y);
            }
        }
        return shape;
    }

    createImageMesh(texture, width, height, flipUV) {
        let geometry = new THREE.Geometry();
        const w = width / 2;
        const h = height / 2;
        let p1 = new THREE.Vector3(-w, -h, 0);
        let p2 = new THREE.Vector3(w, -h, 0);
        let p3 = new THREE.Vector3(w, h, 0);
        let p4 = new THREE.Vector3(-w, h, 0);
        geometry.vertices.push(p1, p2, p3, p4);
        let normal = new THREE.Vector3(0, 0, 1);
        let face0 = new THREE.Face3(0, 1, 2, normal);
        let face1 = new THREE.Face3(0, 2, 3, normal);
        geometry.faces.push(face0, face1);
        let t0 = new THREE.Vector2(0, 0);
        let t1 = new THREE.Vector2(1, 0);
        let t2 = new THREE.Vector2(1, 1);
        let t3 = new THREE.Vector2(0, 1);
        if (flipUV) {
            let uv1 = [t0, t1, t2];
            let uv2 = [t0, t2, t3];
            geometry.faceVertexUvs[0].push(uv1, uv2);
        } else {
            let uv1 = [t3, t2, t1];
            let uv2 = [t3, t1, t0];
            geometry.faceVertexUvs[0].push(uv1, uv2);
        }
        let mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 1.0, color: 0xffffff });
        let mesh = new THREE.Mesh(geometry, mat);
        return mesh;
    }

    assignMaterial(mesh, material) {
        return new Promise((resolve, reject) => {
            if (!mesh || !material) {
                reject();
                return;
            }
            const self = this;

            let _assign = function (mesh, material) {
                mesh.material = materialUtils.toThreeMaterial(material);
                if (mesh.enablePolygonOffset) {
                    mesh.material.polygonOffset = true;
                    mesh.material.polygonOffsetFactor = -0.75;
                    mesh.material.polygonOffsetUnits = -4.0;
                }
                let mat = mesh.material;
                if (mat.map) {
                    if (self._clonedTextureMaps.has(mat.map) == false) {
                        const clonedMap = mat.map.clone();
                        let s = 1;
                        if (material.materialMeta && material.materialMeta.schemaVersion == undefined && material.materialMeta.version == undefined) {
                            // for old CM material.
                            s = 0.1;
                        }
                        clonedMap.repeat.set(s / material.width, s / material.height);
                        clonedMap.needsUpdate = true;
                        self._clonedTextureMaps.set(mat.map, clonedMap);
                    }
                    mat.map = self._clonedTextureMaps.get(mat.map);
                }
            }

            material.monitorMaterialLoad(() => {
                if (material.hasTexture()) {
                    material.monitorDiffuseTextureLoad(() => {
                        _assign(mesh, material);
                        resolve();
                    })
                }
                else {
                    _assign(mesh, material);
                    resolve();
                }
            })
        });
    }

    createArc(x0, y0, radius, theta, color, opa) {
        let shape = new THREE.Shape();
        shape.absarc(x0, y0, radius, theta / 180 * Math.PI, (theta + 90) / 180 * Math.PI, false);
        shape.lineTo(x0, x0);
        let arcGeometry = new THREE.ShapeGeometry(shape);

        let mesh = new THREE.Mesh(arcGeometry, new THREE.MeshBasicMaterial({ color: (color !== undefined) ? color : 0xffffff, transparent: true, opacity: (opa !== undefined) ? opa : 0.5, side: THREE.DoubleSide }));
        return mesh;
    }

    createLineLoop(vertices, material) {
        let geometry = new THREE.Geometry();
        vertices.forEach(v => {
            geometry.vertices.push(v);
        });
        return this.makeLineLoop(geometry, material);
    }

    createCircle(center, radius, material, dir) {
        let normal = new THREE.Vector3(dir.x, dir.y, dir.z);
        const segments = 64;
        let geometry = new THREE.CircleGeometry(radius, segments);

        // Remove center vertex
        geometry.vertices.shift();
        let circle = this.makeLineLoop(geometry, material);
        const zUp = new THREE.Vector3(0, 0, 1);
        const angle = Math.acos(normal.dot(zUp));
        const axis = normal.cross(zUp).normalize();

        circle.quaternion.setFromAxisAngle(axis, angle);
        circle.position.copy(center);
        return circle;
    }

    createSector(center, radius, material, thetaStart, thetaLength, dir) {
        let normal = new THREE.Vector3(dir.x, dir.y, dir.z);
        const segments = 64;
        let geometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaLength);

        // geometry.vertices.shift();
        let circle = this.makeLineLoop(geometry, material);
        const zUp = new THREE.Vector3(0, 0, 1);
        const angle = Math.acos(normal.dot(zUp));
        const axis = normal.cross(zUp).normalize();

        circle.quaternion.setFromAxisAngle(axis, angle);
        circle.position.copy(center);
        return circle;
    }

    makeLine(geo, mat) {
        let line = new THREE.Line(geo, mat);
        line.clone = this._clone;
        return line;
    }

    makeLineLoop(geo, mat) {
        let line = new THREE.LineLoop(geo, mat);
        line.clone = this._clone;
        return line;
    }

    _clone() {
        return new this.constructor(this.geometry, this.material).copy(this);
    }

    createExtrude(shape, settings) {
        const geometry = new THREE.ExtrudeGeometry(shape, settings);
        const material = new THREE.MeshPhongMaterial({ flatShading: true });
        return new THREE.Mesh(geometry, material);
    }

    createSphere(origin, radius, settings) {
        const { widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength } = (settings ? settings : {});
        const geometry = new THREE.SphereGeometry(
            radius,
            widthSegments ? widthSegments : 32,
            heightSegments ? heightSegments : 32,
            phiStart ? phiStart : 0,
            phiLength ? phiLength : 2 * Math.PI,
            thetaStart ? thetaStart : 0,
            thetaLength ? thetaLength : Math.PI);
        const material = new THREE.MeshPhongMaterial({ flatShading: true });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(origin);
        return sphere;
    }

    createTextMesh(font, text, textsize, textcolor) {
        font = font.font;
        let group = new THREE.Object3D();
        let matBlack = new THREE.MeshLambertMaterial({ color: textcolor, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });
        let geo = this._createTextGeometry(text, font);
        let mesh = this._createText(geo, matBlack);
        group.add(mesh);
        group.scale.setScalar(textsize);
        return group;
    }

    createTextWithBackground(font, text, pos, textsize, textcolor, backgroundcolor) {
        if (textcolor == undefined) {
            textcolor = 0x000000;
        }
        if (backgroundcolor == undefined) {
            backgroundcolor = 0xffffff;
        }

        let group = new THREE.Object3D();

        font = font.font;
        let matBlack = new THREE.MeshLambertMaterial({ color: textcolor, depthTest: false, transparent: true, opacity: 0.99, depthWrite: false });

        let geo = this._createTextGeometry(text, font);
        let meshBlack = this._createText(geo, matBlack);
        let background = this._createBackground(geo, backgroundcolor);
        background.position.z += 0.5;
        group.add(meshBlack);
        group.add(background);

        group.scale.setScalar(textsize);
        group.position.copy(pos);

        return group;
    }

    _createBackground(textGeo, backgrondcolor) {
        // let geometry = new THREE.PlaneGeometry( textGeo.boundingBox.max.x+30, textGeo.boundingBox.max.y+30 );
        let geometry = new THREE.CircleGeometry(textGeo.boundingBox.max.x + 10 / 2, 16);
        let material = new THREE.MeshBasicMaterial({ color: backgrondcolor, side: THREE.DoubleSide });
        return new THREE.Mesh(geometry, material);
    }

    _createText(textGeo, mat) {
        let text = new THREE.Mesh(textGeo, mat)
        text.position.x = -1 - textGeo.boundingBox.max.x / 2;
        text.position.y = 1 - textGeo.boundingBox.max.y / 2;
        text.castShadow = true;
        return text;
    }

    _createTextGeometry(strText, font) {
        let shapes = font.generateShapes(strText, 30);
        let textGeo = new THREE.ShapeBufferGeometry(shapes);
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();
        return textGeo;
    }

    disposeMaterial(mat) {
        let mats = Array.isArray(mat) ? mat : [mat];
        mats.forEach(itr => {
            if (itr.map) {
                itr.map = undefined;//All texture maps will be disposed in the this.destroy() method
            }
            itr.dispose();
        });
    }

    reset() {
        this._clonedTextureMaps.forEach((value) => {
            value.dispose();
        })
        this._clonedTextureMaps.clear();
    }
}

export { ThreeDrawTool }