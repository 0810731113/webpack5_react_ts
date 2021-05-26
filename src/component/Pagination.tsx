import { Pagination as APagination } from "antd";
import { PaginationProps as Props } from "antd/lib/pagination";
import React from "react";

export interface PaginationProps extends Props, React.RefAttributes<HTMLElement> {}

export default function Button(props: PaginationProps) {
  return <APagination className="glodon-pagination" {...props} />;
}
