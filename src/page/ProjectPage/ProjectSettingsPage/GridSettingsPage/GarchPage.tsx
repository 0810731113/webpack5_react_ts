import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { Button, Checkbox, Select, Space, Modal, Divider } from "antd";
import consts from "consts";
import { useImmer } from "use-immer";
import { gridSettingsService } from "service";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { useRequest } from "@umijs/hooks";
import { GridType } from "service/grid.settings.service";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";

interface GarchPageProps {}

interface State {
  version: number;
}

const { PUBLIC_URL } = consts;

export default function GarchPage(props: GarchPageProps) {
  const {} = props;
  const [{ version }, updateState] = useImmer<State>({ version: 0 });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = async () => gridSettingsService.getGridType(projectId);
  const { loading, data: gridType, run } = useRequest(loader);

  const chooseGARCH = () => {
    Modal.confirm({
      title: `风险提示`,
      content: `由于两种轴网数据目前暂时不兼容，创建轴网后无法更换绘制方式`,
      cancelText: "我已了解风险，确定选择",
      okText: "我再想想",
      okButtonProps: { ghost: true },
      onOk() {
        return Promise.resolve(true);
      },
      onCancel() {
        return gridSettingsService
          .postGridType(projectId, GridType.GARCH)
          .then(() => {
            run();
          });
      },
    });
  };

  useEffect(() => {
    gridSettingsService.get(projectId).then((res) => {
      updateState((draft) => void (draft.version = res.version ?? 0));
    });
  }, []);

  return (
    <div className="grid-route-page">
      <div className="header">轴网</div>

      <div className="body">
        <div className="info-area" style={{ width: "100%" }}>
          <div className="info-title">
            <img src={`${PUBLIC_URL}/garch_logo.png`} />
            <Divider type="vertical" />
            <span>使用软件绘制</span>
          </div>

          <div
            style={{
              margin: "24px 0",
              fontSize: 12,
              display: "flex",
              lineHeight: 2,
            }}
          >
            <div style={{ opacity: 0.65 }}>使用方法：</div>
            <div
              style={{
                opacity: 0.65,
              }}
            >
              <div>1.在“设置-协同设置”设置项目管理员；</div>
              <div>
                2.在下方点击“确认选择”，确认使用广联达建筑设计绘制项目级轴网；
              </div>
              <div>
                3.任意拥有“项目管理员”权限的用户登录广联达建筑设计，打开项目-打开工作单元；
              </div>
              <div>4.在工具栏点击“轴网”或“批量创建轴网”创建需要的轴网；</div>
              <div>5.创建好的轴网可以使用动态面板中的工具可进行精细编辑；</div>
              <div>6.点击“轴网”功能组下“提交为项目级轴网”；</div>
              <div>7.提交成功后即可共享给项目下所有的工作单元使用。</div>
            </div>
          </div>
          <div className="info-footer" style={{ paddingTop: 24 }}>
            <Space size="middle">
              {gridType === null ? (
                <Space size="small">
                  <CheckPermission
                    resouseType={ResourcePermissionResourceEnum.ProjectSetting}
                  >
                    <Button type="primary" onClick={chooseGARCH}>
                      确认选择
                    </Button>
                  </CheckPermission>

                  <Link to={url.split("/garch")[0]}>
                    <Button>返回重选</Button>
                  </Link>
                </Space>
              ) : (
                <span>
                  最终版本：{gridType === null ? "未创建" : `V${version}`}
                </span>
              )}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}
