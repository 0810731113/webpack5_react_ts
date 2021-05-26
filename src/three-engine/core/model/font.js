import * as THREE from "three";
import { EventsManager } from "../events/manager";
import { Events } from "../events/events";
class Font {
  constructor() {
    this._font = null;
    this._loaded = false;
  }

  load() {
    let self = this;
    let loader = new THREE.FontLoader();
    loader.load(`${process.env.PUBLIC_URL}/assets/chinese.js`, (font) => {
      self._font = font;
      self._loaded = true;
      EventsManager.instance().dispatch(Events.fontLoaded);
      EventsManager.instance().dispatch(Events.fitView);
    });
  }

  get loaded() {
    return this._loaded;
  }

  get font() {
    return this._font;
  }
}

export { Font };
