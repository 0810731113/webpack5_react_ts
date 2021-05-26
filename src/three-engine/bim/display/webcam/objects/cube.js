import * as THREE from "three";
import { Viewable } from "../../../../core/display/viewable";
import { Body } from "../../../../core/display/brep/body";
import { DirtyType } from "../../../../core/display/dirtytype";
import topImg from "three-engine/assets/cube/top.png";
import leftImg from "three-engine/assets/cube/left.png";
import rightImg from "three-engine/assets/cube/right.png";
import bottomImg from "three-engine/assets/cube/bottom.png";
import frontImg from "three-engine/assets/cube/front.png";
import backImg from "three-engine/assets/cube/back.png";

class Cube3d extends Viewable {
  constructor(scene, context, entity) {
    super(scene, context, entity);
    this._textures = [];
    this._loadTextures();
    this._faces = [];
  }

  _onCreateSceneNode() {
    let body = this._entity.body;
    if (!body || (!body.meshData && body.faces.length < 1)) {
      return;
    }
    if (this._textures.length !== 6) {
      return;
    }

    let viewable = new Body(this._scene, this._context, body);
    viewable.createSceneNode();
    this._node.add(viewable.node);
    this._meshes = this._getMeshes(this._node);
    this._faces = viewable.faces;
    this._applyTextures();
    this.applyTransform();
    this.hideOutline();
    viewable.node.position.z = -0.5;
    this._entity.dirty = DirtyType.Nothing;
  }

  _applyTextures() {
    let s1 = this._textures.length;
    let s2 = this._faces.length;
    if (s1 !== s2 || s1 !== 6) {
      return;
    }
    for (let i = 0; i < 6; i++) {
      let face = this._faces[i];
      let mesh = face.mesh;
      let texture = this._textures[i];
      mesh.material.map = texture;
    }
  }

  _loadTextures() {
    [bottomImg, topImg, frontImg, rightImg, backImg, leftImg].forEach((itr) => {
      this._load(itr);
    });
  }

  _load(img) {
    let loader = new THREE.TextureLoader();
    let texture = loader.load(img, (texture) => {
      this._textures.push(texture);
      texture.needsUpdate = true;
    });
    return texture;
  }

  _getExtraScale() {
    return 1000;
  }
}

export { Cube3d };
