import React, { ReactNode } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface PanelTabTitleProps {
  title?: string | ReactNode;
  tip?: string;
  tipLabel?: string;
  icon?: ReactNode | ReactNode[];
  actions?: ReactNode | ReactNode[];
}
export default function PanelTabTitle({
  tip,
  tipLabel,
  title,
  icon,
  actions,
}: PanelTabTitleProps) {
  return (
    <span className="panel-tab-title">
      <span>
        {icon}
        {title}：
      </span>
      {tip && (
        <Tooltip
          trigger="hover"
          mouseEnterDelay={1}
          placement="bottomLeft"
          title={tip}
        >
          <span className="tab-icon-wrap">
            {tipLabel || <InfoCircleOutlined />}
          </span>
        </Tooltip>
      )}
      {actions}
    </span>
  );
}
