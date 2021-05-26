import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { fontService, userService } from "service";
import { useImmer } from "use-immer";
import consts from "consts";

import { Modal, Button, Tabs } from "antd";
import { useRequest } from "@umijs/hooks";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import Loading from "component/Loading";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { ProjectFontVO } from "api-struc/generated/model";
import { publishEvent } from "function/stats.func";
import FontsList from "./FontsList";
import UploadFontButton from "./UploadFontButton";

const { PUBLIC_URL } = consts;

interface FontSettingsPageProps {}

interface State {
  showtip: boolean;
  fonts: ProjectFontVO[];
}

export default function FontSettingsPage(props: FontSettingsPageProps) {
  const {} = props;
  const [{ showtip, fonts }, updateState] = useImmer<State>({
    showtip: false,
    fonts: [],
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const { loading, data, run } = useRequest(() =>
    fontService.getFontList(projectId).then((_fonts) =>
      updateState((draft) => {
        draft.fonts = _fonts ?? [];
      }),
    ),
  );

  useEffect(() => {}, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="font-settings">
      <div className="control-actions">
        <div className="action-button">
          <CheckPermission
            resouseType={ResourcePermissionResourceEnum.GeneralConfigurationStyleLib}
          >
            <TooltipWrapper
              when={(tooltipProps) => tooltipProps.disabled ?? false}
              title="示例项目暂不支持"
            >
              <UploadFontButton
                fontList={fonts}
                projectId={projectId}
                onComplete={() => {
                  run();
                  publishEvent(`uploadFont`, ["项目配置", `通用配置`], {
                    eventLevel: "P2",
                  });
                }}
              />
            </TooltipWrapper>
          </CheckPermission>
        </div>

        <Button
          type="link"
          onClick={() =>
            updateState((draft) => {
              draft.showtip = true;
            })
          }
        >
          如何使用上传的字体？
        </Button>
      </div>

      <FontsList fonts={fonts} onReload={() => run()} />

      <Modal
        title=""
        centered
        visible={showtip}
        footer={null}
        width={920}
        onCancel={() =>
          updateState((draft) => {
            draft.showtip = false;
          })
        }
      >
        <img src={`${PUBLIC_URL}/font_guide.png`} style={{ width: "100%" }} />
      </Modal>
    </div>
  );
}
