class BimfaceInstance {
    constructor(viewerId) {
        this._app = null;
        this._config = null;
        this._domElement = null;
        this._view3d = null;
        this._viewerId = viewerId;
    }

    initBf(token) {
        return new Promise((resolve, reject) => {
            let loaderConfig = new BimfaceSDKLoaderConfig();
            loaderConfig.viewToken = token;
            BimfaceSDKLoader.load(loaderConfig, () => resolve(), () => reject());
        });
    }

    load(token, BFVIewConfig) {
        return new Promise((resolve, reject) => {
            this._free();

            this.initBf(token).then(() => {
                this._setupConfig(BFVIewConfig);
                this._app = new Glodon.Bimface.Application.WebApplication3D(this._config);
                this._view3d = this._app.getViewer();
                this._view3d.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, () => {
                    if (!BFVIewConfig.viewHouse) {
                        this._view3d.hideViewHouse();
                    }
                    resolve(this._view3d);
                });
                this._app.addView(token);
            }).catch(() => reject())
        });
    }

    exit() {
        this._free();
    }

    //给指定id的构件着色
    applyColorByids(ids, color, opacity){
        if(!this.isViewReady()){
            return;
        }
        var appliedColor = new Glodon.Web.Graphics.Color(color, opacity);
        this._view3d.overrideComponentsColorById(ids, appliedColor);
    }

    //恢复构件默认的颜色，透明度，隔离状态等，将构件恢复到默认状态
    recoveryAllDefault(){
        if(!this.isViewReady()){
            return;
        }
        this._view3d.restoreAllDefault();
    }

    //隔离指定构件，使其他构件透明
    isloateElement(ids){
        if(!this.isViewReady()){
            return;
        }
        var state = Glodon.Bimface.Viewer.IsolateOption.MakeOthersTranslucent;
        this._view3d.isolateComponentsById(ids, state);
    }

    //使所有构件透明
    transparentAll(){
        if(!this.isViewReady()){
            return;
        }
        this._view3d.transparentAllComponents();
    }

    //设置背景色,如果设置两个颜色，代表背景渐变
    setBackground(color1, color2){
        if(!this.isViewReady()){
            return;
        }
        var backGroundColor1;
        var backGroundColor2;
        if(!color1 && !color2){
            console.error('至少需要指定一个颜色');
            return;
        }
        backGroundColor1 = color1 ? new Glodon.Web.Graphics.Color(color1) : null;
        backGroundColor2 = color2 ? new Glodon.Web.Graphics.Color(color2) : null;
        this._view3d.setBackgroundColor(backGroundColor1, backGroundColor2);
    }

    zoomToSelectedElement(ids) {
        if(!this.isViewReady()){
            return;
        }
        this._view3d.setSelectedComponentsById(ids);
        this._view3d.zoomToSelectedComponents();
    }

    //渲染
    render(){
        this._view3d.render();
    }

    isViewReady(){
        if(!this._view3d){
            console.error('该instance的模型加载未成功，请先加载模型');
            return false;
        }
        return true;
    }


    //ModelTree
    _setupConfig(BFVIewConfig) {
        this._config = new Glodon.Bimface.Application.WebApplication3DConfig();
        this._config.Buttons = BFVIewConfig.mainToolbar.data;
        var toolBars = [];
        if(BFVIewConfig.mainToolbar.show){
            toolBars.push('MainToolbar');
        }
        if(BFVIewConfig.modelTree){
            toolBars.push('ModelTree');
        }
        this._config.Toolbars = toolBars;
        this._domElement = document.getElementById(this._viewerId)
        this._config.domElement = this._domElement;
    }

    _free() {
        if (this._app && this._app.destroy) {
            this._app.destroy();
            this._app = null;
        }
    }
}

export { BimfaceInstance }