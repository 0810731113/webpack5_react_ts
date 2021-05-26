import React, { cloneElement, PropsWithChildren } from "react";
import { Tooltip } from "antd";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

interface TooltipWrapperProps extends TooltipPropsWithTitle {
  when: (props: TooltipWrapperProps) => boolean;
  defaultTitle?: string;
  wrapStyle?: React.CSSProperties;
  disabled?: boolean;
}

export interface State {}

export function TooltipWrapper(props: PropsWithChildren<TooltipWrapperProps>) {
  const {
    children,
    disabled,
    when,
    title,
    defaultTitle,
    wrapStyle,
    style,
    ...rest
  } = props;

  const child = disabled
    ? cloneElement(children as any, {
        disabled: true,
        onClick: null,
      })
    : children;

  if (when(props)) {
    return (
      <Tooltip trigger="hover" title={title} placement="bottom" {...rest}>
        <div className=" button-wrap show-tip-disabled" style={wrapStyle}>
          {child}
        </div>
      </Tooltip>
    );
  }

  if (defaultTitle) {
    return (
      <Tooltip
        trigger="hover"
        title={defaultTitle}
        placement="bottom"
        {...rest}
      >
        {child}
      </Tooltip>
    );
  }

  return <>{child}</>;
}
