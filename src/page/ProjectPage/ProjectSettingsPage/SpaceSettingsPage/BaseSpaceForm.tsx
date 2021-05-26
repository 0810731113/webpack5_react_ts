import React, { useState, useEffect } from "react";
import {
  Input,
  TextArea,
  Descriptions,
  DescriptionsItem,
  Button,
} from "component/Antd";
import { FormOutlined } from "@ant-design/icons";
import { Form, InputNumber } from "antd";
import { useImmer } from "use-immer";
import { Store } from "rc-field-form/lib/interface";

interface infoProps {
  name: string;
  description: string;
  type: string;
  // value: string;
}
interface BaseSpaceFormProps {
  isEdit?: boolean;
  info: infoProps;
  onChangeInfo: (newInfo: infoProps) => void;
  onEdit?: () => void;
  canEdit?: boolean;
}
interface FieldInterface {
  label: string;
  name: "name" | "description" | "type";
  rules?: any[];
  component: typeof Input | typeof TextArea | typeof InputNumber;
  disabled: boolean;
}

const FormItem = Form.Item;

const fields: FieldInterface[] = [
  {
    label: "名称",
    name: "name",
    // rules: [{ required: true, message: "请输入名称!" }],
    component: Input,
    disabled: false,
  },
  {
    label: "类型",
    name: "type",
    component: Input,
    disabled: true,
  },
  {
    label: "描述",
    name: "description",
    component: TextArea,
    disabled: false,
  },
];

// const fields2: FieldInterface[] = [
//   {
//     label: "名称",
//     name: "name",
//     rules: [{ required: true, message: "请输入名称!" }],
//     component: Input,
//     disabled: false,
//   },
//   {
//     label: "类型",
//     name: "type",
//     component: Input,
//     disabled: true,
//   },
//   {
//     label: "描述",
//     name: "description",
//     component: TextArea,
//     disabled: false,
//   },
//   {
//     label: "标高",
//     name: "value",
//     component: InputNumber,
//     rules: [{ required: true, message: "请输入标高!" }],
//     disabled: false,
//   },
// ];

const BaseSpaceForm = (props: BaseSpaceFormProps) => {
  const { isEdit = true, info, onChangeInfo, onEdit, canEdit } = props;
  const [form] = Form.useForm();

  // const fields = info.type === "Floor" ? fields2 : fields1;

  useEffect(() => {
    // const { value, ...rest } = info;
    // form.setFieldsValue({ value: parseFloat(value), ...rest });
    form.setFieldsValue(info);
  }, [info && info.name, info && info.description]);
  const onChange = (values: Store) => {
    onChangeInfo &&
      onChangeInfo({
        name: values.name,
        description: values.description,
        type: values.type,
        // value: values.value,
      });
  };
  return isEdit ? (
    <Form
      form={form}
      labelCol={{ span: 1 }}
      onValuesChange={(changedValues, values) => {
        onChange(values);
      }}
    >
      {fields.map((field) => (
        <FormItem {...field} labelAlign="left"	>
          {/* {field.name === "value" ? (
            <field.component step={0.001} />
          ) : ( */}
          <field.component
            allowClear
            disabled={field.disabled}
            style={{ width: 600 }}
          />
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
          </span>
        </DescriptionsItem>
      ))}
    </Descriptions>
  );
};
export default BaseSpaceForm;
