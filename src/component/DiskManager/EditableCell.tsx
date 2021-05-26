import React, { useState, useRef, useEffect } from "react";
import { Table, Input, InputNumber, Popconfirm, Form, Space } from "antd";
import { InfoCircleFilled, FileFilled, FolderFilled } from "@ant-design/icons";
import { FileListItem } from "./FileList";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  // title: any;
  inputType: "number" | "text";
  record: FileListItem;
  index: number;
  children: React.ReactNode;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  // title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  // const inputNode =
  //   inputType === "number" ? <InputNumber /> : <Input size="small" />;

  const inputRef = useRef<Input>(null);

  const formNode = (
    <Form.Item
      name={dataIndex}
      rules={[
        {
          required: true,
          message: `请输入名字`,
        },
      ]}
    >
      <Input size="small" ref={inputRef} />
    </Form.Item>
  );

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <td {...restProps}>
      {editing ? (
        dataIndex === "name" ? (
          <Space>
            <FolderFilled style={{ color: "#ffca28", fontSize: 16 }} />
            {formNode}
          </Space>
        ) : (
          formNode
        )
      ) : (
        children
      )}
    </td>
  );
};
