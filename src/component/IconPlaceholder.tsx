import { BorderInnerOutlined } from "@ant-design/icons";
import React from "react";

export interface IconPlaceholderProps {
  size?: number;
  fontSize?: number;
  backgroundColor?: string;
}

export interface State {}

export default function IconPlaceholder(props: IconPlaceholderProps) {
  const { size, fontSize, backgroundColor } = props;

  return (
    <span
      style={{
        display: "inline-flex",
        width: size ?? 20,
        height: size ?? 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
      }}
    >
      <BorderInnerOutlined style={{ fontSize: fontSize ?? 18 }} />
    </span>
  );
}
