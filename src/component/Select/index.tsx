import { Select as ASelect, Pagination } from "antd";
import { SelectProps } from "antd/lib/select";
import { OptionProps } from "rc-select/lib/Option";
import React from "react";

export default function Select(props: SelectProps<any>) {
  return <ASelect {...props} />;
}
export function SelectOption(props: OptionProps) {
  return <ASelect.Option {...props} />;
}
