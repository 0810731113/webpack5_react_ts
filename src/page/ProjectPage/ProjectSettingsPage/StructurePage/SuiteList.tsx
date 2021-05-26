import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";

import { Space, Empty } from "antd";
import consts from "consts";
import { SuiteMetaBean } from "api-struc/generated/model";

const { GJW_STATIC_URL, PUBLIC_URL } = consts;

interface SuiteListProps {
  data: SuiteMetaBean[];
  setSelSuite: (suite: SuiteMetaBean) => void;
}

interface State {}

export default function SuiteList(props: SuiteListProps) {
  const { data, setSelSuite } = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  const imageError = (e: any) => {
    const img = e.target;
    img.src =
      "https://gdc-te-public.obs.cn-north-4.myhuaweicloud.com/0cb03ea6-c774-4f16-bdd1-25c42fa90a06";
    img.onerror = null;
  };

  const renderThumbnail = (item: any) => {
    if (item.status && item.status === "PROCESSED_FAILED") {
      return <img src={`${PUBLIC_URL}/analyse_failed.png`} />;
    }

    if (item.status && item.status === "PROCESSING") {
      return <img src={`${PUBLIC_URL}/analysing.png`} />;
    }

    if (item.thumbnail) {
      return (
        <img src={`${GJW_STATIC_URL}/${item.thumbnail}`} onError={imageError} />
      );
    }
  };

  return (
    <div className="suites-list">
      {data instanceof Array && data.length > 0 ? (
        data.map((item, key) => (
            <div className="card" key={item.id}>
              <div className="pic-area" onClick={() => setSelSuite(item)}>
                {renderThumbnail(item)}
              </div>
              <div className="card-title">{item.name}</div>
            </div>
          ))
      ) : (
        <div style={{ margin: "0 auto", width: 200, paddingTop: 16 }}>
          <Empty
            description={
              <div>
                <Space direction="vertical">
                  <div>构件为空</div>
                </Space>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
