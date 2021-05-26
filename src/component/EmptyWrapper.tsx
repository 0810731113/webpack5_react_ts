import { Empty } from "antd";
import { EmptyProps } from "antd/lib/empty";
import consts from "consts";
import React from "react";

const { PUBLIC_URL } = consts;
export interface EmptyWrapperProps extends EmptyProps {
  isEmpty: boolean;
  children?: any;
}

export interface State {}

export default function EmptyWrapper(props: EmptyWrapperProps) {
  const { isEmpty, children, ...rest } = props;

  if (isEmpty) {
    return (
      <Empty image={`${PUBLIC_URL}/assets/images/empty@2x.png`} {...rest} />
    );
  } 
    return <>{children}</>;
  
}
