import { defaultScrollbarSettings, isPanel } from "consts";
import React, { PropsWithChildren } from "react";
import Scrollbars, { ScrollbarProps } from "react-custom-scrollbars";
import { useImmer } from "use-immer";

export interface Props extends ScrollbarProps {}

export interface State {}

export default function Scrollbar(props: PropsWithChildren<Props>) {
  const { children, style, ...rest } = props;
  const [{}, updateState] = useImmer<State>({});

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <Scrollbars
      {...defaultScrollbarSettings}
      {...rest}
      style={{ ...defaultScrollbarSettings.style, ...style }}
    >
      {children}
    </Scrollbars>
  );
}
