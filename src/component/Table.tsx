import { Table as ATable } from "antd";
import { TableProps as Props } from "antd/lib/table";
import React from "react";

export interface TableProps
  extends Props<any>,
    React.RefAttributes<HTMLElement> {}

export default function Table(props: TableProps) {
  const { pagination = { pageSize: 20 }, scroll = { y: 0 }, ...rest } = props;
  return <ATable {...props} pagination={pagination} />;
}
