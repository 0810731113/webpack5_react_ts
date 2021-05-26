import React, { useState, useEffect } from "react";
import {
  Input,
  TextArea,
  Descriptions,
  DescriptionsItem,
  Button,
} from "component/Antd";
import { FormOutlined } from "@ant-design/icons";
import { Form } from "antd";
import { useImmer } from "use-immer";
import { Store } from "rc-field-form/lib/interface";

interface infoProps {
  name: string;
  description: string;
}
interface BaseInfoFormProps {
  isEdit?: boolean;
  info: infoProps;
  onChangeInfo: (newInfo: infoProps) => void;
  onEdit?: () => void;
  canEdit?: boolean;
}
interface FieldInterface {
  label: string;
  name: "name" | "description";
  rules?: any[];
  component: typeof Input | typeof TextArea;
}

const FormItem = Form.Item;

const fields: FieldInterface[] = [
  {
    label: "资料包名称",
    name: "name",
    rules: [{ required: true, message: "请输入资料包名称!" }],
    component: Input,
  },
  { label: "资料包描述", name: "description", component: TextArea },
];

const BaseInfoForm = (props: BaseInfoFormProps) => {
  const { isEdit = true, info, onChangeInfo, onEdit, canEdit } = props;
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
      onValuesChange={(changedValues, values) => {
        onChange(values);
      }}
    >
      {fields.map((field) => (
        <FormItem {...field}>
          <field.component allowClear />
        </FormItem>
      ))}
    </Form>
  ) : (
    <Descriptions>
      {fields.map((field) => (
        <DescriptionsItem label={field.label}>
          <span className="base-info-text">
            <span>
              {field.name === "description"
                ? info[field.name]?.split("\n").map((text) => (
                    <>
                      {text}
                      <br />
                    </>
                  ))
                : info[field.name]}
            </span>
            {onEdit && (
              <Button
                className="edit-button"
                type="link"
                disabled={!canEdit}
                icon={<FormOutlined style={{ fontSize: 12 }} />}
                onClick={() => onEdit && onEdit()}
              />
            )}
          </span>
        </DescriptionsItem>
      ))}
    </Descriptions>
  );
};
export default BaseInfoForm;
