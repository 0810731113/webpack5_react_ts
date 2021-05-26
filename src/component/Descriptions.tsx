import React from "react";
import { Descriptions as ADescriptions } from "antd";
import { DescriptionsProps as Props } from "antd/lib/descriptions";
import { DescriptionsItemProps as ADescriptionsItemProps } from "antd/lib/descriptions/Item";

interface DescriptionsItemProps extends ADescriptionsItemProps {
  width?: number;
}
interface DescriptionsProps extends Props {}
export function DescriptionsItem(props: DescriptionsItemProps) {
  const { ...rest } = props;
  return <ADescriptions.Item {...rest} />;
}
export default function Descriptions(props: DescriptionsProps) {
  const { column = 1, size = "small", ...rest } = props;
  return <ADescriptions {...rest} size={size} column={column} />;
}
