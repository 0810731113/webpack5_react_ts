import React, { useEffect, useContext } from "react";
import { FolderOpenFilled, FolderFilled } from "@ant-design/icons";
import {
  Empty,
  message,
  Space,
  Tag,
  Button,
  Tooltip,
  Descriptions,
} from "antd";
import { useImmer } from "use-immer";
import PanelTabTitle from "component/PanelTabTitle";
import panelService from "service/panel.service";
import { gridSettingsService, spaceSettingsService } from "service";
import PanelPageContext from "../PanelPageContext";

interface ToolsPageProps {
  activeKey: string;
}

interface State {
  spaceVersion?: number;
  gridVersion?: number;
}

export default function ToolsPage(props: ToolsPageProps) {
  const { activeKey } = props;
  const [{ spaceVersion, gridVersion }, updateState] = useImmer<State>({});

  const {
    currentOperatingWorkUnitId,
    workunitReadonly,
    specialtyType,
    projectId,
  } = useContext(PanelPageContext);
  const prepareData = async () => {
    if (projectId) {
      const gridSettings = await gridSettingsService.get(projectId);
      const spaceSettings = await spaceSettingsService.get(projectId);
      updateState((draft) => {
        draft.spaceVersion = spaceSettings.version;
        draft.gridVersion = gridSettings.version;
      });
    }
  };
  useEffect(() => {
    if (activeKey === "4") {
      prepareData();
    }
  }, [activeKey, projectId]);

  return (
    <div className="panel-body">
      <div className="title">
        <PanelTabTitle
          title="其他"
          tip="其他页包含更新设置、上传图纸等便捷的功能"
        />
      </div>

      <div className="config-block">
        <div className="block-title">更新设置</div>
        <div className="block-line">
          <Descriptions title="轴网" column={2}>
            <Descriptions.Item label="最新版本">
              {gridVersion ? `V${gridVersion}` : "(未选择)"}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions title="空间和标高" column={2}>
            <Descriptions.Item label="最新版本">
              {spaceVersion ? `V${spaceVersion}` : "(未选择)"}
            </Descriptions.Item>
          </Descriptions>
          <Button
            disabled={workunitReadonly}
            onClick={() => {
              panelService.updateprojectsetting().then(() => {
                message.success("更新成功");
              });
            }}
          >
            更新项目级设置
          </Button>
        </div>
        <div className="block-line">
          <Button
            disabled={workunitReadonly}
            onClick={() => {
              if (specialtyType === "GST") {
                message.info("暂无专业设置");
              } else {
                panelService.updatemajorsetting().then(() => {
                  message.success("更新成功");
                });
              }
            }}
          >
            更新专业级设置
          </Button>
        </div>
      </div>

      {/* <div className="config-block">
        <div className="block-title">图纸</div>
        <div className="block-line">
          <Button
            disabled={workunitReadonly}
            onClick={() => {
              if (specialtyType === "GMEP") {
                message.info("暂不支持上传图纸");
              } else {
                panelService.uploadPaper().then(() => {
                  message.success("上传成功");
                });
              }
            }}
          >
            上传图纸
          </Button>
        </div>
      </div> */}
    </div>
  );
}
