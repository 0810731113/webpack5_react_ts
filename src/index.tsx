import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

if (module && module.hot) {
  module.hot.accept();
}

// ReactDOM.render(<App name='vortesnail' age={25} />, document.querySelector('#root'));


import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { isPanel, loadConfig as LoadConfigFromServer } from "consts";
// import React from "react";
// import ReactDOM from "react-dom";
// import "url-search-params-polyfill";
import "./index.css";
// import * as serviceWorker from "./serviceWorker";

const loadable = require("@loadable/component").default;

const WebApp = loadable(() => import("./App"));
const PanelApp = loadable(() => import("./AppPanel"));
const DownloadChromeApp = loadable(() => import("./page/DownloadChromePage"));

if (module && module.hot) {
  module.hot.accept();
}

const rootNode = document.getElementById("root");
if (rootNode) {
  // 先从服务器加载配置再渲染
  LoadConfigFromServer().then((_) => {
    ReactDOM.render(
      <React.StrictMode>
        {isPanel === "true" ? (
          <ConfigProvider locale={zhCN}>
            <PanelApp />
          </ConfigProvider>
        ) : (
          <ConfigProvider locale={zhCN}>
            <WebApp />
          </ConfigProvider>
        )}
      </React.StrictMode>,
      rootNode,
    );
  });

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  //serviceWorker.unregister();
}
