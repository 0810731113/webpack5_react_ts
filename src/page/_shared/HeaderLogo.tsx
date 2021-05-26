import React from "react";
import consts from "consts";

const { PUBLIC_URL } = consts;
export interface HeaderLogoProps {}

export interface State {}

export default function HeaderLogo(props: HeaderLogoProps) {
  const {} = props;

  return <img src={`${PUBLIC_URL}/gdcp_logo.png`} className="logo" />;
}
