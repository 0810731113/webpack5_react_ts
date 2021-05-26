import classNames from "classnames";
import React from "react";

export interface TableWrapperProps {
  size?: "small" | "middle" | "normal";
  children?: any;
}

export interface State {}

export default function TableWrapper(props: TableWrapperProps) {
  const { size, children } = props;
  const className = classNames({
    "ant-table": true,
    "ant-table-middle": size === "middle",
    "ant-table-small": size === "small",
  });
  return (
    <div className={className}>
      <div className="ant-table-container">
        <div className="ant-table-content">{children}</div>
      </div>
    </div>
  );
}
