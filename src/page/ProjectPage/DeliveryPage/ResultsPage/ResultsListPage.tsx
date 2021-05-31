import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button } from "component/Antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Table, Tooltip, Popover, Input, Divider, Tag } from "antd";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { publishEvent } from "function/stats.func";
import DeliveryUnitsList from "../DeliveryUnitsList";

interface ResultsListPageProps {}

interface State {
  count: number;
}

export default function ResultsListPage(props: ResultsListPageProps) {
  const {} = props;
  const [{ count }, updateState] = useImmer<State>({ count: 0 });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

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
                publishEvent(`createResources`, ["项目交付", "资源池"], {
                  eventLevel: "P1",
                });
                history.push(`${url}/create`);
              }}
            >
              创建交付单元
            </Button>
          </TooltipWrapper>
        </CheckPermission>

        <div>
          <Tooltip
            trigger="hover"
            title="您可以将多个工作单元整合在一起作为交付单元"
          >
            <InfoCircleOutlined />
          </Tooltip>
          <span className="count-text">交付单元数量 :</span>
          <span className="count">{count}</span>
        </div>
      </div>

      <DeliveryUnitsList
        onCountUnits={(newCount) =>
          updateState((draft) => {
            draft.count = newCount;
          })
        }
      />
    </div>
  );
}
