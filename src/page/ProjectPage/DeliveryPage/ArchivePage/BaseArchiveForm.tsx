import React, { useState, useEffect } from "react";
import {
  Input,
  TextArea,
  Descriptions,
  DescriptionsItem,
  FormItem,
} from "component/Antd";
import { Form } from "antd";
import { useImmer } from "use-immer";
import { Store } from "rc-field-form/lib/interface";

interface infoProps {
  name: string;
  description: string;
}
interface BaseArchiveFormProps {
  isEdit?: boolean;
  info: infoProps;
  onChangeInfo?: (newInfo: infoProps) => void;
}

const BaseArchiveForm = (props: BaseArchiveFormProps) => {
  const { isEdit = true, info, onChangeInfo } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue(info);
  }, [info && info.name, info && info.description]);
  const onChange = (values: Store) => {
    onChangeInfo &&
      onChangeInfo({ name: values.name, description: values.description });
  };
  return isEdit ? (
    <Form
      form={form}
      // labelAlign="left"
      style={{ marginTop: 12 }}
      labelCol={{ span: 2 }}
      wrapperCol={{ span: 8 }}
      onValuesChange={(changedValues, values) => {
        onChange(values);
        // console.log(values);
      }}
    >
      <FormItem
        label="名称"
        name="name"
        rules={[{ required: true, message: "请输入交付包名称!" }]}
      >
        <Input />
      </FormItem>
      <FormItem label="备注" name="description">
        <TextArea allowClear maxLength={200} />
      </FormItem>
    </Form>
  ) : (
    <Descriptions>
      <DescriptionsItem label="资料包名称">{info.name}</DescriptionsItem>
      <DescriptionsItem label="描述">{info.description}</DescriptionsItem>
    </Descriptions>
  );
};
export default BaseArchiveForm;
