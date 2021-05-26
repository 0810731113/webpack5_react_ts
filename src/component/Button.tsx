import { Button as AButton } from "antd";
import { ButtonProps as Props } from "antd/lib/button";
import React from "react";

export interface ButtonProps extends Props, React.RefAttributes<HTMLElement> {}

export default function Button(props: ButtonProps) {
  return <AButton {...props} />;
}
