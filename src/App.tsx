/*import React from 'react';
import './App.scss';

interface IProps {
  name: string;
  age: number;
}

function App(props: IProps) {
  const { name, age } = props;
  return (
    <div className='app'>
      我是一个组件
    </div>
  );
}

export default App;*/

import React, { Component, Suspense, lazy,useEffect } from 'react';
import {Spin} from 'antd';
// import Drawer from "component/Drawer/Drawer";
import consts, { IS_MAC, TALKING_DATA_URL } from "consts";
import { publishEvent } from "function/stats.func";
import { useInitWss } from "hook/use-initwss.hook";
import LazyLoading from 'component/LazyLoading';
// import ForbiddenPage from "page/ForbiddenPage";
// import LandingPage from "page/LandingPage";
// import LogInPage from "page/LoginPage";
// import LogoutPage from "page/LogoutPage";
// import ModelComparatorPage from "page/ModelComparatorPage";
// import ModelViewerPage from "page/ModelViewerPage";
// import NotFoundPage from "page/NotFoundPage";
// import ProjectPage from "page/ProjectPage/ProjectPage";
// import ApplyPage from "page/Apply";
// import { WebMaintenance } from "page/UnderMaintenance";
// import WorkspacePage from "page/ProjectPage/WorkspacePage/WorkspacePage";
import { hot } from "react-hot-loader/root";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import useScript from "react-script-hook";
import { RecoilRoot } from "recoil";
import { QueryParamProvider } from "use-query-params";
import "./App.less";
import "./App.scss";
// import MaintainLogin from "page/MaintainLogin";
// import DownloadPage from "page/DownloadPage";
// import VideosPage from "page/VideosPage/VideosPage";
import { getCookie } from "function/cookie.func";

const WorkspacePage = lazy(() => import('./page/ProjectPage/WorkspacePage/WorkspacePage'));
const DownloadPage = lazy(() => import('./page/DownloadPage'));
const MaintainLogin = lazy(() => import('./page/MaintainLogin'));
const VideosPage = lazy(() => import('./page/VideosPage/VideosPage'));

const ForbiddenPage = lazy(() => import('./page/ForbiddenPage'));
const LandingPage = lazy(() => import('./page/LandingPage'));
const LogInPage = lazy(() => import('./page/LoginPage'));
const LogoutPage = lazy(() => import('./page/LogoutPage'));
const ModelComparatorPage = lazy(() => import('./page/ModelComparatorPage'));
const ModelViewerPage = lazy(() => import('./page/ModelViewerPage'));
const NotFoundPage = lazy(() => import('./page/NotFoundPage'));
const ProjectPage = lazy(() => import('./page/ProjectPage/ProjectPage'));
const ApplyPage = lazy(() => import('./page/Apply'));
const WebMaintenance = lazy(() => import('./page/UnderMaintenance'));
const Drawer = lazy(() => import('./component/Drawer/Drawer'));
const { AUTH_BASE_URL, PUBLIC_URL, LOGOUT_URL } = consts;

if (!IS_MAC) {
  import("./style/scrollbar.css" as any).then((res) => {
    // console.log(res);
  });
}
import("./style/scrollbar.css" as any).then((res) => {
  // console.log(res);
});

function App() {
  const { ENV } = consts;
  const [loadingConfig, configError] = useScript({
    src:
    // ENV === "production"
    //   ? "https://aecore.glodon.com/static/bimface/JSHostConfig.js"
      "",
  });
  const [loading, error] = useScript({
    src:
    // ENV === "production"
    //   ? "https://aecore-bimface-static.glodon.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js"
      "https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js",
  });
  const [loadingTalkingData] = useScript({
    src: TALKING_DATA_URL!,
  });
  useEffect(() => {
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel("cookieChannel");
      channel.onmessage = ({ data }) => {
        // console.log(data);
        if (data === "userChange") {
          location.href = `${
            window.location.href.split("/web")[0]
          }/web/workspace?viewType=personal`;
        }
        if (data === "logout") {
          const isPersonalAccount = getCookie("isPersonalAccount");
          location.href = `${AUTH_BASE_URL}/logout?returnTo=${LOGOUT_URL}?isPersonalAccount=${isPersonalAccount}`;
        }
      };
      return () => {
        channel.close();
      };
    }
  }, [history]);

  useInitWss();
  // useEffect(() => {
  //   publishEvent(`打开Web`, {
  //     前向来源: document.referrer ?? "URL直达",
  //   });
  // }, []);

  if ((ENV === "production" ? loadingConfig : true) && loading)
    return <h3>Loading Stripe API...</h3>;
  if ((ENV === "production" ? configError : true) && error)
    return <h3>Failed to load Stripe API: {error.message}</h3>;
  // if (!loadingTalkingData) {

  // }
  return (
    // <StripeProvider apiKey="pk_test_6pRNASCoBOKtIshFeQd4XMUh">
    <RecoilRoot>
      <BrowserRouter basename={PUBLIC_URL}>
        <QueryParamProvider ReactRouterRoute={Route}>
          <Suspense fallback={<LazyLoading />}>
            <Switch>
              <Route path="/workspace" component={WorkspacePage} />
              <Route path="/model-viewer" component={ModelViewerPage} />
              <Route path="/model-comparator" component={ModelComparatorPage} />
              <Route path="/projects/:projectId" component={ProjectPage} />
              <Route path="/logout" component={LogoutPage} />
              <Route path="/drawer" exact component={Drawer} />
              <Route path="/" exact component={LogInPage} />
              <Route path="/enterprise" exact component={LogInPage} />
              <Route path="/apply" component={ApplyPage} />
              {/* <Route path="/oldLogin" exact component={LandingPage} /> */}
              <Route path="/download/:software" exact component={DownloadPage} />
              <Route path="/videos/:album" exact component={VideosPage} />
              {/* <Route path="/temp-login" exact component={LoginIframe} /> */}
              <Route path="/maintainLogin" exact component={MaintainLogin} />
              {/* <Route path="/forbidden" exact component={ForbiddenPage} /> */}
              <Route path="/maintenance" exact component={WebMaintenance} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </Suspense>
        </QueryParamProvider>
      </BrowserRouter>
    </RecoilRoot>
    // </StripeProvider>
  );
}

export default App;

