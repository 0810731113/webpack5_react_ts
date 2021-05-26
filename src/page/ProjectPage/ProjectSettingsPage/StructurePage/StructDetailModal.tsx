import React, { useEffect, useState } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";

import { Modal, Button } from "antd";
import consts from "consts";
import { SuiteMetaBean } from "api-struc/generated/model";
import Iframe from "component/Iframe";
import { structureService } from "service";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";

const { GJW_URL, API_BASE_STRUC_URL } = consts;

interface StructDetailModalProps {
  selSuite: SuiteMetaBean | null;
  onCancel: () => void;
  onRefresh: () => void;
}

interface IframeProps {
  selSuite: SuiteMetaBean | null;
  source: "project" | "common";
}

interface State {}

const projectIframeUrl = (item: SuiteMetaBean, projectId: string) => {
  const { id } = item;
  const { version } = item;

  const typeQueryKey = "name";
  const propertiesDataVersion = "v2";

  const propertiesApi = encodeURIComponent(
    `${API_BASE_STRUC_URL}/structural/project/${projectId}/suite/${id}/${version}/family/info`,
  );
  const detailApi = encodeURIComponent(
    `${API_BASE_STRUC_URL}/structural/project/${projectId}/suite/${id}/${version}/info`,
  );

  let url = `${GJW_URL}/external/detail/${id}`;
  url += `?detailApi=${detailApi}`;
  url += `&propertiesApi=${propertiesApi}`;
  url += `&typeQueryKey=${typeQueryKey}`;
  url += `&propertiesDataVersion=${propertiesDataVersion}`;

  return url;
};

const GJWIframe = (props: IframeProps) => {
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const { selSuite, source } = props;
  const [isLoading, setIsLoading] = useState(true);

  const getUrl = () => {
    if (source === "common") {
      return `${GJW_URL}/#/public/contents/${selSuite?.id}?softwareVersion=${
        (selSuite as any).softwareVersion
      }`;
    }
    if (source === "project") {
      // return projectIframeUrl(selSuite!, projectId);
      return `${GJW_URL}/?version=${selSuite?.version}#/projects/${projectId}/contents/${selSuite?.id}`;
    }
    return "";
  };

  return (
    <>
      {isLoading && <div>加载中。。。</div>}
      <Iframe
        scrolling="no"
        onLoad={() => setIsLoading(false)}
        src={getUrl()}
      />
    </>
  );
};

function StructDetailModal(props: StructDetailModalProps) {
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const { selSuite, onRefresh, ...rest } = props;
  const [{}, updateState] = useImmer<State>({});

  useEffect(() => {}, []);

  return (
    <Modal
      {...rest}
      visible={!!selSuite}
      footer={
        <CheckPermission resouseType={ResourcePermissionResourceEnum.GJK}>
          <TooltipWrapper
            when={({ disabled }) => disabled ?? false}
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="primary"
              ghost
              danger
              onClick={() => {
                Modal.confirm({
                  title: "确认删除该构件么？",
                  async onOk() {
                    if (selSuite && selSuite.id) {
                      return structureService
                        .deleteSuiteProject(projectId, selSuite.id as any)
                        .then((data) => {
                          props.onRefresh();
                          props.onCancel();
                          // let suitesAdded = data?.data;
                          // if (
                          //   suitesAdded instanceof Array &&
                          //   suitesAdded.length > 0
                          // ) {
                          //   run();
                          //   updateState(
                          //     (draft) => void (draft.hasPreset = true),
                          //   );
                          // } else {
                          //   Modal.info({
                          //     title: "非常抱歉，暂无可用预设构件可载入",
                          //     content: null,
                          //     onOk() {},
                          //   });
                          // }
                        });
                    }
                  },
                });
              }}
            >
              删除该构件
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      }
      width={1260}
      destroyOnClose
      maskClosable={false}
      title="构件详情"
      wrapClassName="structure-modal"
    >
      <div className="content-container">
        <GJWIframe selSuite={selSuite} source="project" />
      </div>
    </Modal>
  );
}

export { StructDetailModal, GJWIframe };
