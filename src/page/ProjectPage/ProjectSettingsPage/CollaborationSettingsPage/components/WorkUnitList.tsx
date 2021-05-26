import { Space, Table, Button, Popconfirm } from "antd";
import { ColumnType } from "antd/lib/table";
import { DataSetVO } from "api/generated/model";
import ProjectSpecialtyName from "page/ProjectPage/_components/ProjectSpecialtyName";
import ProjectUserName from "page/ProjectPage/_components/ProjectUserName";
import React from "react";
import { workUnitService } from "service";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { PopconfirmWrapper } from "component/wrapper/PopconfirmWrapper";

export interface WorkUnitListProps {
  workUnits: DataSetVO[];
  onViewWorkUnit?: (workUnitId: string) => void;
  onDeleted: (id: string) => void;
}

export interface State {}

export default function WorkUnitList({
  workUnits,
  onDeleted,
  onViewWorkUnit,
}: WorkUnitListProps) {
  const columns: ColumnType<DataSetVO>[] = [
    {
      title: "单元名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "专业",
      dataIndex: "specialty",
      key: "specialty",
      render(row, record) {
        return (
          <ProjectSpecialtyName id={record.specialtyId!} unknownText="-" />
        );
      },
    },
    {
      title: "负责人",
      dataIndex: "ownerId",
      key: "ownerId",
      render(row, record) {
        return <ProjectUserName id={record.ownerId!} unknownText="-" />;
      },
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      render(row, record) {
        return (
          <Space>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="link"
                  onClick={() => {
                    onViewWorkUnit?.(record.id!);
                  }}
                >
                  编辑
                </Button>
              </TooltipWrapper>
            </CheckPermission>

            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <PopconfirmWrapper
                  title={`确定要删除工作单元 (${record.name}) 吗?`}
                  onConfirm={() => {
                    workUnitService.deleteWorkUnit(record.id!).then(() => {
                      onDeleted(record.id!);
                    });
                  }}
                  onCancel={console.log}
                  okText="确认"
                  cancelText="取消"
                  disabled={!!record.tipVersion}
                >
                  <Button type="link" disabled={!!record.tipVersion}>
                    删除
                  </Button>
                </PopconfirmWrapper>
              </TooltipWrapper>
            </CheckPermission>
          </Space>
        );
      },
    },
  ];
  return <Table columns={columns} dataSource={workUnits} pagination={false} />;
}
