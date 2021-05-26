import { Input as AInput } from "antd";
import {
  InputProps as Props,
  TextAreaProps as ATextAreaProps,
} from "antd/lib/input";
import React from "react";

export interface InputProps extends Props {}
export interface TextAreaProps extends ATextAreaProps {}

const Input: React.FC<InputProps> = (props: InputProps) => {
  const { placeholder = "请输入", ...rest } = props;
  return <AInput {...rest} placeholder={placeholder} />;
};
export interface InputProps extends Props {}

export const TextArea: React.FC<TextAreaProps> = (props: TextAreaProps) => {
  const {
    placeholder = "请输入",
    autoSize = { minRows: 5, maxRows: 5 },
    ...rest
  } = props;
  return (
    <AInput.TextArea {...rest} placeholder={placeholder} autoSize={autoSize} />
  );
};
export default Input;
