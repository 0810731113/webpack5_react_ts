import {FileStoreHelper as filestorehelper} from '../filestore/filestorehelper';
import JSM from '../extension/jsmodeler';
import * as THREE from 'three';
import {Material} from '../model/material';
import fileUrlType from '../filestore/fileurltype';

class ProdLoader {
    constructor() {
    }

    loadProd(prodInfo) {
        if (!prodInfo.loaded) {
            throw (`prod is not ready to be loaded. you need load the prodinfo first.`)
        }

        if (prodInfo.prodFileType == 'ObjFile' || prodInfo.assetType === 'obj') {
            return this.loadObjProd(prodInfo);
        } else if (prodInfo.prodFileType == 'JsonFile') {
            let material = new Material();
            return this.loadMaterial(material, prodInfo).then((mat) => {
                return mat
            });
        }
    }

    loadObjProd(prodInfo) {
        if (!prodInfo.loaded) {
            throw (`prod is not ready to be loaded. you need load the prodinfo first.`)
        }
        if (prodInfo.prodFile == undefined) {
            throw ('failed to load prod. empty prod file. ');
        }

        let fileReader = prodInfo.fileReader;

        // first, try to read obj and mat file.
        let objectInitTasks = [];
        objectInitTasks.push(fileReader(prodInfo.prodFile, 'text'));
        let materialFile = this._tryGetReferencesFile(prodInfo, 'mtl');
        if (materialFile != null && materialFile != undefined) {
            objectInitTasks.push(fileReader(materialFile.referenceFile, 'text'));
        }

        let self = this;
        return Promise.all(objectInitTasks).then(streams => {
            let pendingLoadTextureFiles = [];
            self.objectData = JSM.ConvertObjToJsonData(streams[0], {
                onFileRequested: (filePath) => {
                    let fileName = this._getFileName(filePath);
                    if (materialFile != null && materialFile != undefined && materialFile.referenceName.endsWith(fileName)) {
                        return streams[1];
                    } else {
                        let pendingReference = self._tryGetReferencesFile(prodInfo, fileName);
                        if (pendingReference != null && pendingReference != undefined) {
                            if (pendingLoadTextureFiles.indexOf(pendingReference) < 0) {
                                pendingLoadTextureFiles.push(pendingReference);
                            }
                            return fileName;
                        } else {
                            console.warn(`prod ${prodInfo.prodFile} miss some texture!`);
                        }
                    }
                }
            });
            return pendingLoadTextureFiles;
        }).then(pendingLoadTextureFiles=>{

            // then try to load texture files.
            let textureloadTasks = [];
            pendingLoadTextureFiles.forEach(pendingTexture => {
                textureloadTasks.push(
                    self._downloadTexture(prodInfo, pendingTexture).then(textureUrl => {
                        return {
                            referneceName: pendingTexture.referenceName,
                            referenceFile: textureUrl,
                        };
                    }));
            });

            if (textureloadTasks.length > 0) {
                return Promise.all(textureloadTasks).then(texturemap => {
                    self.texturMapData = texturemap;
                    return self._createThreeGroup();
                });
            } else {
                return self._createThreeGroup();
            }
        })
    }

    loadMaterial(material, prodInfo) {
        let self = this;
        if (prodInfo.loaded) {
            let fileReader = prodInfo.fileReader;

            material.width = prodInfo.boundWidthX;
            material.height = prodInfo.boundHeightY;
            if(prodInfo.prodFile && prodInfo.prodFile!=='') {
                // load the json file.
                return fileReader(prodInfo.prodFile, 'text')
                    .then(materialData => {
                        self._assingMaterial(prodInfo, material, materialData);
                    })
            }else{
                return Promise.resolve();
            }

        } else {
            return prodInfo.load().then(() => {
                material.width = prodInfo.boundWidthX;
                material.height = prodInfo.boundHeightY;
                self.loadMaterial(material, prodInfo);
            })
        }
    }

    _downloadTexture(prodinfo, pendingTexture){
        if(prodinfo.fileUrlType === fileUrlType.DirectPath){
            return Promise.resolve(pendingTexture.referenceFile);
        }
        else{
            return prodinfo.fileReader(pendingTexture.referenceFile)
                .then(res => {
                    const blob = new Blob([res]);
                    let localUrl = window.URL.createObjectURL(blob);
                    return localUrl
                });
        }
    }

    _createThreeGroup() {
        if (this.objectData) {
            if (this.objectData.meshes === undefined
                || this.objectData.meshes.length <= 0
                || this.objectData.materials === undefined) {
                throw 'the prod data is wrong, can not create three group!';
            }
            return this._loadTextureImg().then(() => {

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
                for (const rawMesh of this.objectData.meshes) {
                    for (const triangle of rawMesh.triangles) {
                        const materialIndex = triangle.material;
                        const parameters = triangle.parameters;
                        const materialData = this.objectData.materials[materialIndex];

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
                                let textureFileName = Object.values(textureData)[0];
                                let textureImageData = this._tryGetTextureData(textureFileName)
                                if (textureImageData != null) {
                                    const texture = new THREE.Texture();
                                    texture.image = textureImageData.textureMapData2;
                                    const isJPEG = textureFileName.search(/\.(jpg|jpeg)$/) > 0 || textureFileName.search(/^data:image\/jpeg/) === 0;
                                    texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
                                    texture.wrapS = THREE.RepeatWrapping;
                                    texture.wrapT = THREE.RepeatWrapping;
                                    texture.needsUpdate = true;
                                    material.map = texture;
                                    material.needsUpdate = true;
                                }

                                texturePendingMap.set(textureData, material);
                            }
                        }

                        const buffer = new THREE.BufferGeometry();
                        const vertices = [];
                        const normals = [];
                        const uvs = [];
                        
                        let v1, v2, v3, n1, n2, n3, u1, u2, u3;
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
                            vertices.push(rawMesh.vertices[v1 + 0]);
                            vertices.push(rawMesh.vertices[v1 + 1]);
                            vertices.push(rawMesh.vertices[v1 + 2]);
                            vertices.push(rawMesh.vertices[v2 + 0]);
                            vertices.push(rawMesh.vertices[v2 + 1]);
                            vertices.push(rawMesh.vertices[v2 + 2]);
                            vertices.push(rawMesh.vertices[v3 + 0]);
                            vertices.push(rawMesh.vertices[v3 + 1]);
                            vertices.push(rawMesh.vertices[v3 + 2]);

                            normals.push(rawMesh.normals[n1 + 0]);
                            normals.push(rawMesh.normals[n1 + 1]);
                            normals.push(rawMesh.normals[n1 + 2]);
                            normals.push(rawMesh.normals[n2 + 0]);
                            normals.push(rawMesh.normals[n2 + 1]);
                            normals.push(rawMesh.normals[n2 + 2]);
                            normals.push(rawMesh.normals[n3 + 0]);
                            normals.push(rawMesh.normals[n3 + 1]);
                            normals.push(rawMesh.normals[n3 + 2]);

                            if (textureData !== undefined && textureData !== null) {
                                let uv = GetTextureCoordinate(rawMesh.uvs[u1 + 0], rawMesh.uvs[u1 + 1], textureOffset, textureScale, textureRotation);
                                uvs.push(uv.x);
                                uvs.push(uv.y);
                                uv = GetTextureCoordinate(rawMesh.uvs[u2 + 0], rawMesh.uvs[u2 + 1], textureOffset, textureScale, textureRotation);
                                uvs.push(uv.x);
                                uvs.push(uv.y);
                                uv = GetTextureCoordinate(rawMesh.uvs[u3 + 0], rawMesh.uvs[u3 + 1], textureOffset, textureScale, textureRotation);
                                uvs.push(uv.x);
                                uvs.push(uv.y);
                            }
                        }

                        buffer.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                        buffer.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                        buffer.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

                        const mesh = new THREE.Mesh(buffer, material);
                        group.add(mesh);
                    }
                }

                return group;
            });
        }
        return null;
    }

    _tryGetTextureData(textureName) {
        for (let i = 0; i < this.texturMapData.length; i++) {
            if (this.texturMapData[i].referneceName.endsWith(textureName)) {
                return this.texturMapData[i];
            }
        }

        return null;
    }

    _loadTextureImg() {
        let textureLoadTasks = [];
        if (this.texturMapData != undefined) {
            for (let i = 0; i < this.texturMapData.length; i++) {
                textureLoadTasks.push(new Promise((resolve) => {
                    const imageLoader = new THREE.ImageLoader(THREE.DefaultLoadingManager);
                    let textureLink = this.texturMapData[i].referenceFile;
                    imageLoader.setCrossOrigin('');
                    imageLoader.load(
                        textureLink,
                        (image) => {
                            window.URL.revokeObjectURL(textureLink);
                            this.texturMapData[i].textureMapData2 = image;
                            resolve();
                        },
                        null,
                        (err) => {
                            console.error(`failed to load texture image for ${textureLink}`)
                            resolve();
                        }
                    );
                }));
            }
        }
        return Promise.all(textureLoadTasks);
    }

    _tryGetReferencesFile(prodInfo, referenceName) {
        for (let i = 0; i < prodInfo.referenceFiles.length; i++) {
            if (prodInfo.referenceFiles[i].referenceName.endsWith(this._getFileName(referenceName))) {
                return prodInfo.referenceFiles[i];
            }
        }

        return null;
    }

    _getFileName(filePath) {
        let sepindex = filePath.lastIndexOf('/');
        if (sepindex < 0) {
            sepindex = filePath.lastIndexOf('\\');
        }
        if (sepindex >= 0) {
            return filePath.substr(sepindex + 1, filePath.length - sepindex - 1);
        }

        return filePath;
    }

    _assingMaterial(prodInfo, material, materialJsonData) {
        if (materialJsonData.diffuse_color != undefined) {
            material.diffuse = materialJsonData.diffuse_color.split(',');
        }
        if (materialJsonData.specular_color != undefined) {
            material.specular = materialJsonData.specular_color.split(',');
        }

        if(materialJsonData.opacity!=undefined){
            material.opacity = materialJsonData.opacity;
        }

        if ((materialJsonData.diffuse_texture != undefined || materialJsonData.diffuse_texture != null)
            && materialJsonData.diffuse_texture.texture_file!='') {
            let reference = this._tryGetReferencesFile(prodInfo, materialJsonData.diffuse_texture.texture_file);

            material.diffuseTextureFile = reference.referenceFile;
        }

        if(prodInfo.referenceFiles!=undefined && prodInfo.referenceFiles!=null){
            material.referenceFiles = prodInfo.referenceFiles;
        }

        material.materialMeta = this._createMaterialMeta(prodInfo);

        material.loaded = true;
    }

    _createMaterialMeta(prodInfo){
        let meta = {};
        Object.assign(meta, prodInfo);
        return meta;
    }
}

export { ProdLoader };