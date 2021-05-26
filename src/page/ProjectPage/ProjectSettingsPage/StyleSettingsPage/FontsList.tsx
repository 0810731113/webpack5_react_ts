import { Button, Space, Tag, Tooltip, Modal, Form, message, Input } from "antd";
import { ProjectParams, FileListParams } from "model/route-params.model";
import Iconfont from "component/Iconfont";
import Table, { ColumnType } from "antd/lib/table";
import React, { useEffect, useRef } from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { fontService } from "service";
import {
  ProjectFontVO,
  ProjectFontVOFontFromEnum,
} from "api-struc/generated/model";
import { renameFileName, parseFileName } from "function/string.func";
import { useImmer } from "use-immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { onResponseError } from "function/auth.func";

interface FontsListProps {
  fonts: ProjectFontVO[];
  onReload: () => void;
}

interface State {
  selectedRowKeys: React.Key[];
  editingKey: null | number;
}

export default function FontsList(props: FontsListProps) {
  const { fonts, onReload } = props;

  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [
    { selectedRowKeys: selectedRows, editingKey },
    updateState,
  ] = useImmer<State>({
    selectedRowKeys: [],
    editingKey: null,
  });

  const [form] = Form.useForm();

  const cancel = () => {
    updateState((draft) => {
      draft.editingKey = null;
    });
  };

  const save = (type: string) => {
    form.validateFields().then((row) => {
      if (editingKey) {
        fontService
          .renameFontById(editingKey, `${row.filename}.${type}`, projectId)
          .then(() => {
            message.success("修改成功")
            onReload();
          })
          .catch(onResponseError)
          .finally(() => {
            cancel();
          });
      }
    });
  };

  const renderToolsButton = (item: ProjectFontVO) => {
    if (item.id === editingKey) {
      return (
        <Space>
          <a onClick={() => item.fileType && save(item.fileType)}>确定</a>
          <a onClick={cancel}>取消</a>
        </Space>
      );
    }
    return (
      <CheckPermission
        resouseType={ResourcePermissionResourceEnum.GeneralConfigurationStyleLib}
      >
        <TooltipWrapper
          when={(tooltipWrapperProps) => tooltipWrapperProps.disabled ?? false}
          title="处于示例项目中无该功能权限"
        >
          <Button
            type="link"
            onClick={() => {
              form.setFieldsValue({
                filename: parseFileName(item.name ?? "").name,
              });
              updateState((draft) => {
                draft.editingKey = item.id!;
              });
            }}
          >
            重命名
          </Button>
        </TooltipWrapper>
      </CheckPermission>
    );
  };

  const columns: ColumnType<ProjectFontVO>[] = [
    {
      title: "字体名称",
      dataIndex: "name",
      key: "name",
      render: (value, item: ProjectFontVO) => (
        <Space>
          {item.fontFrom === ProjectFontVOFontFromEnum.COMMON ? (
            <Iconfont type="icon-setting" style={{ color: "#13c2c2" }} />
          ) : (
            <Iconfont type="icon-shangchuan" style={{ color: "#FAAD14" }} />
          )}
          <span>{item.name}</span>
        </Space>
      ),
    },
    {
      title: "字体类型",
      dataIndex: "fileType",
      key: "fileType",
      width: "12%",
    },

    {
      title: "操作",
      dataIndex: "id",
      key: "id",
      // align: "right",
      width: "20%",
      render(value, item) {
        return renderToolsButton(item);
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (col.dataIndex !== "name") {
      return col;
    }

    return {
      ...col,
      onCell: (record: ProjectFontVO) => ({
        record,
        dataIndex: col.dataIndex,
        editing: record.id === editingKey,
        children: null,
      }),
    };
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Form form={form} component={false}>
        <Table
          pagination={{ pageSize: 200, hideOnSinglePage: true }}
          columns={mergedColumns}
          dataSource={fonts}
          components={{
            body: {
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              cell: EditableCell,
            },
          }}
        />
      </Form>
    </Space>
  );
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  record: ProjectFontVO;
  index: number;
  children: React.ReactNode;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputRef = useRef<Input>(null);

  const formNode = (
    <Form.Item
      name="filename"
      rules={[
        {
          required: true,
          message: `请输入名字`,
        },
      ]}
    >
      <Input
        size="small"
        ref={inputRef}
        addonAfter={record?.fileType}
        maxLength={35}
      />
    </Form.Item>
  );

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <td {...restProps}>
      {editing && dataIndex === "name" ? (
        <Space>
          {record.fontFrom === ProjectFontVOFontFromEnum.COMMON ? (
            <Iconfont type="icon-setting" style={{ color: "#13c2c2" }} />
          ) : (
            <Iconfont type="icon-shangchuan" style={{ color: "#FAAD14" }} />
          )}
          {formNode}
        </Space>
      ) : (
        children
      )}
    </td>
  );
};
