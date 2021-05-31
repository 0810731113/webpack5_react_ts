import React, { useEffect, useCallback, useState } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { useImmer } from "use-immer";

import { Button } from "component/Antd";
import { Empty, Space, Tooltip, Table } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { publishEvent } from "function/stats.func";
import ArchiveList from "./ArchiveList";

interface ArchiveListPageProps {}

interface State {
  count: number;
}

export default function ArchiveListPage(props: ArchiveListPageProps) {
  const {} = props;
  const [{ count }, updateState] = useImmer<State>({
    count: 0,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const history = useHistory();

  return (
    <div className="body">
      <div className="info-action">
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.ArchivePackage}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="primary"
              onClick={() => {
                publishEvent(`createArchives`, ["项目交付", "交付包"], {
                  eventLevel: "P1",
                });
                history.push(`${url}/create`);
              }}
            >
              新建交付包
            </Button>
          </TooltipWrapper>
        </CheckPermission>

        <div>
          <Tooltip
            trigger="hover"
            title="交付包由交付单元等资源组成，您可以将多个交付单元打包进交付包，一并交付给指定广联达用户"
          >
            <InfoCircleOutlined />
          </Tooltip>
          <span className="count-text">项目交付包数量 :</span>
          <span className="count">{count}</span>
        </div>
      </div>
      <ArchiveList
        onCountUnits={(newCount) =>
          updateState((draft) => {
            draft.count = newCount;
          })
        }
      />
    </div>
  );
}
