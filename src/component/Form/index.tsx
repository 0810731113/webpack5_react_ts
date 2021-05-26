import React from "react";
import { Form as AForm } from "antd";
import {
  FormItemProps as AFormItemProps,
  FormProps as Props,
} from "antd/lib/form";

interface FormItemProps extends AFormItemProps {}
interface FormProps extends Props {}
export function FormItem(props: FormItemProps) {
  return <AForm.Item {...props} />;
}
export default function Form(props: FormProps) {
  const {
    wrapperCol = { xs: 18, sm: 18, md: 20, lg: 21 },
    labelCol = { xs: 6, sm: 6, md: 4, lg: 3 },
  } = props;
  return <AForm {...props} wrapperCol={wrapperCol} labelCol={labelCol} />;
}
