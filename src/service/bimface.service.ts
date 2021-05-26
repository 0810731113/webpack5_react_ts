import { first, isArray } from "lodash";
import consts from "consts";

declare const BimfaceSDKLoaderConfig: any;
declare const BimfaceSDKLoader: any;
declare const Glodon: any;
export interface BimfaceServiceConfig {
  domId: string;
  format: string;
  viewTokens: string | string[];
  toolbars?: string[];
  cameraAnimation?: boolean;
}
export class BimfaceService {
  initViewToken: string | null = null;

  domId: string;

  format: string;

  viewTokens: string[];

  toolbars: string[] = ["MainToolbar"];

  cameraAnimation?: boolean = false;

  _app: any;

  constructor(
    config: BimfaceServiceConfig,
    private onViewerCreated: (app: any, viewer: any) => void,
    private onLoaded?: () => void,
    private onViewAdded?: (viewToken: string) => void,
  ) {
    this.domId = config.domId;
    this.format = config.format;
    this.viewTokens = isArray(config.viewTokens)
      ? config.viewTokens
      : [config.viewTokens];
    this.cameraAnimation = config.cameraAnimation;
    this.toolbars = config.toolbars ?? ["MainToolbar"];
    this.initViewToken = first(this.viewTokens) ?? null;
  }

  start2D(viewToken: string, domElement: HTMLElement) {
    const config = new Glodon.Bimface.Application.WebApplicationDrawingConfig();
    config.domElement = domElement;
    const app = new Glodon.Bimface.Application.WebApplicationDrawing(config);
    app.load(viewToken);
    return app;
  }

  start3D(viewToken: string, domElement: HTMLElement) {
    const config = new Glodon.Bimface.Application.WebApplication3DConfig();
    config.domElement = domElement;
    config.Toolbars = this.toolbars;
    this._app = new Glodon.Bimface.Application.WebApplication3D(config);
    const view3d = this._app.getViewer();
    view3d.render();
    return this._app;
  }

  init() {
    const loaderConfig = new BimfaceSDKLoaderConfig();
    loaderConfig.viewToken = this.initViewToken;
    loaderConfig.version = "3.6.102";
    BimfaceSDKLoader.load(
      loaderConfig,
      (viewMetaData: any) => {
        if (!this.initViewToken) {
          return;
        }

        this.onLoaded && this.onLoaded();

        const domElement = document.getElementById(this.domId)!;
        const is3D = this.format !== "dwg";
        let app: any = null;
        if (is3D) {
          app = this.start3D(this.initViewToken, domElement);
        } else {
          app = this.start2D(this.initViewToken, domElement);
        }

        const viewer = app.getViewer();
        this.onViewerCreated && this.onViewerCreated(app, viewer);
        viewer.setCameraAnimation &&
          viewer.setCameraAnimation(this.cameraAnimation);
      },
      console.error,
    );
  }
}
