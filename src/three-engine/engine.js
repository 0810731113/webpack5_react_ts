import { BimApplication } from "./bim/application";
import { Application } from "./core/application";
import { ViewTypes } from "./bim/viewtypes";

class Engine {
  constructor() {}

  static boot() {
    let app = new BimApplication();
    Application.setInstance(app);
    app.run();
  }

  static run() {}

  static exit() {
    Application.instance().destroy();
  }

  static show3d() {
    let app = Application.instance();
    let viewer3d = app.viewerManager.viewers.get(ViewTypes.web3d);
    viewer3d.init(ViewTypes.web3d);
    viewer3d.activate();
    viewer3d.fitScreen();
    let webcam = app.viewerManager.viewers.get(ViewTypes.webcam);
    webcam.init(ViewTypes.webcam);
    webcam.activate();
    webcam.fitScreen();
  }
}

export { Engine };
