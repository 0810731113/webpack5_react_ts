import { Row as ARow } from "antd";
import { RowProps } from "antd/lib/row";
import React from "react";
import RcQueueAnim from "rc-queue-anim";

export default function Row(props: RowProps) {
  const { children, ...rest } = props;
  return (
    <RcQueueAnim component={ARow} componentProps={{ ...rest }}>
      {children}
    </RcQueueAnim>
  );
}
