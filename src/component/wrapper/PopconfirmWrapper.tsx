import React, { cloneElement, PropsWithChildren } from "react";
import { Popconfirm, PopconfirmProps } from "antd";

interface PopconfirmWrapperProps extends PopconfirmProps {
  disabled?: boolean;
}

export interface State {}

export function PopconfirmWrapper(
  props: PropsWithChildren<PopconfirmWrapperProps>,
) {
  const { children, disabled, ...rest } = props;

  if (disabled) {
    return cloneElement(children as any, {
      disabled: true,
      onClick: null,
    });
  }

  return <Popconfirm {...rest}>{children}</Popconfirm>;
}
