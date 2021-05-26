import { BimfaceInstance } from './instance';
import { ViewTypes } from '../bim/viewtypes';


class CompareEngine {
    constructor() {
        this._prev = new BimfaceInstance(ViewTypes.compareleft);
        this._latest = new BimfaceInstance(ViewTypes.compareright);

        this._focus = null;

        this._prevViewer = null;
        this._latestViewer = null;

        this._viewPrevBind = this.bind(this, this.viewPrevBind);
        this._viewLatestBind = this.bind(this, this.viewLatestBind);
    }

    get prev() {
        return this._prev;
    }

    get latest() {
        return this._latest;
    }

    //业务功能实现，对指定的id构件着色，并zoom到该构件，其余构件半透明
    applyColor(ids, color, opacity) {
        //调用instance(bimface instance)提供的功能实现需求

        //恢复所有构件
        this._prev.recoveryAllDefault();
        this._latest.recoveryAllDefault();

        //对构件着色
        this._prev.applyColorByids(ids, color, opacity);
        this._latest.applyColorByids(ids, color, opacity);

        //隔离指定构件，其他构件透明
        this._prev.isloateElement(ids);
        this._latest.isloateElement(ids);

        //渲染一次
        this._prev.render();
        this._latest.render();
    }

    transparentAll(instance) {
        if (!(instance instanceof BimfaceInstance)) {
            console.error('暂不支持该instance，目前仅支持bimface instance');
            return;
        }
        instance.transparentAll();
    }

    setBackground(instance, color) {
        if (!(instance instanceof BimfaceInstance)) {
            console.error('暂不支持该instance，目前仅支持bimface instance');
            return;
        }
        instance.setBackground(color);
    }

    switchLatestView(viewToken) {
        this._latestViewer.removeView('0b23a3e9995b489e924b99a256993c4c');
        this._latest._app.addView('4b1b5826150447d08cd43eef8ec58b0f');
        // this.viewLatestBind();

        console.log(viewToken);
    }

    bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    }

    boot() {
        //return this._app.init();
    }

    loadViews(token1, token2) {
        var BFVIewConfig = {
            mainToolbar: {
                show: true,
                data: ['Home', 'RectangleSelect', 'Measure', 'Section', 'Property', 'Information']
            },
            viewHouse: false,
            modelTree: false,
            backgroundColor: '#f5f5f5'
        }

        return this._prev.load(token1, BFVIewConfig).then((viewer1) => {
            //使用bimface instance提供的透明和设置背景功能
            this.transparentAll(this._prev);
            this.setBackground(this._prev, BFVIewConfig.backgroundColor);
            this._prevViewer = viewer1;

            // BFVIewConcig.mainToolbar.show = false;
            BFVIewConfig.viewHouse = true;
            BFVIewConfig.modelTree = false;

            return this._latest.load(token2, BFVIewConfig).then((viewer2) => {
                this.transparentAll(this._latest);
                this.setBackground(this._latest, BFVIewConfig.backgroundColor);
                this._latestViewer = viewer2;

                this.correspond();

                this.viewPrevBind();
                this.viewLatestBind();
            })
        })
    }

    viewPrevBind() {
        console.log('viewPrevBind')
        //用新模型的状态更新旧模型状态
        let latestState = this._latestViewer.getCurrentState();
        this._prevViewer.setState(latestState);
        this._prevViewer.getViewer().camera.up.copy(this._latestViewer.getViewer().camera.up);
        // this._prevViewer.render();
    }
    viewLatestBind() {
        console.log('viewLatestBind')
        //用旧模型的状态更新新模型状态
        let prevState = this._prevViewer.getCurrentState();
        this._latestViewer.setState(prevState);
        this._latestViewer.getViewer().camera.up.copy(this._prevViewer.getViewer().camera.up);
        // this._latestViewer.render();
    }

    correspond() {

        this._latest._domElement.addEventListener('mousedown', () => {

            if (this._focus === 0) return
            this._focus = 0;

            this._prevViewer.removeEventListener('Rendered', this._viewLatestBind);
            this._latestViewer.addEventListener('Rendered', this._viewPrevBind);
        })

        this._prev._domElement.addEventListener('mousedown', () => {

            if (this._focus === 1) return
            this._focus = 1;

            this._latestViewer.removeEventListener('Rendered', this._viewPrevBind);
            this._prevViewer.addEventListener('Rendered', this._viewLatestBind);
        })

        this._prevViewer.addEventListener('ComponentsHoverChanged', (e) => {
            this._latestViewer.getViewer().modelManager.sceneState.setHoverId(e.objectId);
        })

        this._latestViewer.addEventListener('ComponentsHoverChanged', (e) => {
            this._prevViewer.getViewer().modelManager.sceneState.setHoverId(e.objectId);
        })

        this._latestViewer.setCameraAnimation(false)
        this._prevViewer.setCameraAnimation(false)
    }

    exit() {
        this._prev.exit();
        this._latest.exit();
    }
}

let compareEngine = new CompareEngine();

export { compareEngine }