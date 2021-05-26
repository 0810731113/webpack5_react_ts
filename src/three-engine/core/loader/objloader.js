import { WorkerWrapper } from '../../app/plugins/furniture/worker';
import { parserFactory } from '../parsers/parserfactory';
import * as THREE from 'three' 

class ObjLoader {
    constructor(host) {
        this._worker = new WorkerWrapper();
        this._host = host;
    }

    load(args) {
        return new Promise((resolve, reject) => {
            if (this._worker) {
                const fileParser = parserFactory.create(args.options.type, this._worker, args.options);
                if (fileParser) {
                    fileParser.parse(() => {
                        this._worker.terminate();
                        let importArgs = {};
                        importArgs.options = Object.assign({}, args.options);
                        importArgs.data = fileParser.data;
                        importArgs.min = fileParser.min;
                        importArgs.max = fileParser.max;
                        this._import(importArgs, (result) => {
                            if (result) {
                                this.entityId = result.id;
                                args.callback(result);
                            }
                            resolve();
                        });
                        fileParser.data = {};
                        importArgs = {};
                    });
                } else {
                    this._worker.terminate();
                    let importArgs = {};
                    importArgs.options = Object.assign({}, args.options);
                    this._import(importArgs, (result) => {
                        if (result) {
                            this.entityId = result.id;
                            args.callback(result);
                        }
                        resolve();
                    });
                    importArgs = {};
                }
            }
        });
    }

    _onLoaded(group) {
        this._host.setData(group);
    }

    _import(args, callback) {
        if (!args
            || !callback) {
            if (callback) {
                callback(null);
            }
            return;
        }

        let self = this;

        if (args.data) {
            if (args.data.meshes === undefined
                || args.data.meshes.length <= 0
                || args.data.materials === undefined) {
                callback(null);
                return;
            }

            const GetTextureCoordinate = (u, v, offset, scale, rotation) => {
                const result = new THREE.Vector2(u, v);
                if (Math.abs(rotation) > 0) {
                    const si = Math.sin(rotation * Math.PI / 180.0);
                    const co = Math.cos(rotation * Math.PI / 180.0);
                    result.x = co * u - si * v;
                    result.y = si * u + co * v;
                }
                result.x = offset[0] + result.x * scale[0];
                result.y = offset[1] + result.y * scale[1];
                return result;
            };

            const group = new THREE.Group();
            const texturePendingMap = new Map();
            for (const rawMesh of args.data.meshes) {
                for (const triangle of rawMesh.triangles) {
                    const materialIndex = triangle.material;
                    const parameters = triangle.parameters;
                    const materialData = args.data.materials[materialIndex];

                    const textureData = materialData.texture;
                    let textureOffset = materialData.offset;
                    let textureScale = materialData.scale;
                    let textureRotation = materialData.rotation;

                    if (textureData !== undefined && textureData !== null) {
                        if (textureOffset === undefined || textureOffset === null) {
                            textureOffset = [0.0, 0.0];
                        }
                        if (textureScale === undefined || textureScale === null) {
                            textureScale = [1.0, 1.0];
                        }
                        if (textureRotation === undefined || textureRotation === null) {
                            textureRotation = 0.0;
                        }
                    }

                    let material;
                    if (texturePendingMap.has(textureData)) {
                        material = texturePendingMap.get(textureData);
                    } else {
                        const diffuseColor = new THREE.Color();
                        const specularColor = new THREE.Color();
                        let shininess = materialData.shininess || 0.0;

                        diffuseColor.setRGB(materialData.diffuse[0], materialData.diffuse[1], materialData.diffuse[2]);
                        specularColor.setRGB(materialData.specular[0], materialData.specular[1], materialData.specular[2]);

                        if (textureData !== undefined && textureData !== null) {
                            diffuseColor.setRGB(1.0, 1.0, 1.0);
                            specularColor.setRGB(1.0, 1.0, 1.0);
                        }

                        if (shininess === 0.0) {
                            specularColor.setRGB(0.0, 0.0, 0.0);
                            shininess = 1;
                        }

                        material = new THREE.MeshPhongMaterial({
                            color: diffuseColor.getHex(),
                            specular: specularColor.getHex(),
                            shininess: shininess,
                            side: THREE.DoubleSide
                        });

                        if (materialData.opacity !== 1.0) {
                            material.opacity = materialData.opacity;
                            material.transparent = true;
                        }

                        if (textureData !== undefined && textureData !== null) {
                            texturePendingMap.set(textureData, material);
                        }
                    }

                    const geometry = new THREE.Geometry();
                    let v1, v2, v3, n1, n2, n3, u1, u2, u3;
                    let lastVertex, lastFace, vertexNormals, textureUVs;
                    for (let i = 0; i < parameters.length; i += 9) {
                        v1 = 3 * parameters[i + 0];
                        v2 = 3 * parameters[i + 1];
                        v3 = 3 * parameters[i + 2];
                        n1 = 3 * parameters[i + 3];
                        n2 = 3 * parameters[i + 4];
                        n3 = 3 * parameters[i + 5];
                        u1 = 2 * parameters[i + 6];
                        u2 = 2 * parameters[i + 7];
                        u3 = 2 * parameters[i + 8];

                        lastVertex = geometry.vertices.length;
                        lastFace = geometry.faces.length;

                        geometry.vertices.push(new THREE.Vector3(rawMesh.vertices[v1 + 0], rawMesh.vertices[v1 + 1], rawMesh.vertices[v1 + 2]));
                        geometry.vertices.push(new THREE.Vector3(rawMesh.vertices[v2 + 0], rawMesh.vertices[v2 + 1], rawMesh.vertices[v2 + 2]));
                        geometry.vertices.push(new THREE.Vector3(rawMesh.vertices[v3 + 0], rawMesh.vertices[v3 + 1], rawMesh.vertices[v3 + 2]));
                        geometry.faces.push(new THREE.Face3(lastVertex + 0, lastVertex + 1, lastVertex + 2));

                        vertexNormals = [];
                        vertexNormals.push(new THREE.Vector3(rawMesh.normals[n1 + 0], rawMesh.normals[n1 + 1], rawMesh.normals[n1 + 2]));
                        vertexNormals.push(new THREE.Vector3(rawMesh.normals[n2 + 0], rawMesh.normals[n2 + 1], rawMesh.normals[n2 + 2]));
                        vertexNormals.push(new THREE.Vector3(rawMesh.normals[n3 + 0], rawMesh.normals[n3 + 1], rawMesh.normals[n3 + 2]));
                        geometry.faces[lastFace].vertexNormals = vertexNormals;

                        if (textureData !== undefined && textureData !== null) {
                            textureUVs = [];
                            textureUVs.push(GetTextureCoordinate(rawMesh.uvs[u1 + 0], rawMesh.uvs[u1 + 1], textureOffset, textureScale, textureRotation));
                            textureUVs.push(GetTextureCoordinate(rawMesh.uvs[u2 + 0], rawMesh.uvs[u2 + 1], textureOffset, textureScale, textureRotation));
                            textureUVs.push(GetTextureCoordinate(rawMesh.uvs[u3 + 0], rawMesh.uvs[u3 + 1], textureOffset, textureScale, textureRotation));
                            geometry.faceVertexUvs[0].push(textureUVs);
                        }
                    }

                    const mesh = new THREE.Mesh(geometry, material);
                    group.add(mesh);
                }
            }

            // We have to wait for all textures are loaded before adding group to scene.
            if (texturePendingMap.size > 0) {
                const promiseList = [];
                for (const textureLoad of texturePendingMap) {
                    promiseList.push(new Promise((resolve) => {
                        const imageLoader = new THREE.ImageLoader(THREE.DefaultLoadingManager);
                        imageLoader.setCrossOrigin('');
                        const originalUrl = Object.values(textureLoad[0])[0];
                        const altUrl = args.data.altTextureUrls ? args.data.altTextureUrls[Object.keys(textureLoad[0])[0]] : undefined;
                        const imageLoaded = (image) => {
                            const texture = new THREE.Texture();
                            texture.image = image;
                            const isJPEG = originalUrl.search(/\.(jpg|jpeg)$/) > 0 || originalUrl.search(/^data:image\/jpeg/) === 0;
                            texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;
                            texture.needsUpdate = true;
                            textureLoad[1].map = texture;
                            textureLoad[1].needsUpdate = true;
                            resolve();
                        };
                        const imageLoadError = (err) => {
                            console.error(err);
                            resolve();
                        };
                        if (altUrl) {
                            imageLoader.load(altUrl, (image) => {
                                window.URL.revokeObjectURL(altUrl);
                                imageLoaded(image);
                            }, null, imageLoadError);
                        } else {
                            imageLoader.load(originalUrl, imageLoaded, null, imageLoadError);
                        }
                    }));
                }

                Promise.all(promiseList)
                    .then(() => {
                        self._onLoaded(group);
                    })
                    .catch((err) => {
                        console.error(err);
                        self._onLoaded(group);
                    });
            } else {
                self._onLoaded(group);
            }
        } else {
            callback(null);
        }
    }
}

export { ObjLoader }