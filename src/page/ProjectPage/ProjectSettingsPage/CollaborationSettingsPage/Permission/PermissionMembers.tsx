import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Divider, Avatar, Card, Tabs, Table, Modal } from "antd";
import { useImmer } from "use-immer";
import { ProjectRole } from "service/role.service";
import { roleService, userService } from "service";
import { ResourcePermission } from "api-authorization/generated/model";
import { UserVO } from "api/generated/model";
import { ColumnType } from "antd/lib/table";

const { Meta } = Card;
interface PermissionMembersProps {
  role: ProjectRole;
}

interface State {
  data: UserVO[];
}

export default function PermissionMembers(props: PermissionMembersProps) {
  const { role } = props;
  const [{ data }, updateState] = useImmer<State>({ data: [] });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    roleService.getProjectUsersByRole(projectId, role).then((userIds) => {
      if (userIds && userIds instanceof Array) {
        userService.listUsersByids(userIds).then((data) => {
          updateState((draft) => void (draft.data = data ?? []));
        });
      }
    });
  }, [role]);

  const columns: ColumnType<UserVO>[] = [
    {
      title: "成员昵称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "手机号",
      dataIndex: "telephone",
      key: "telephone",
    },
    // {
    //   title: "状态",
    //   dataIndex: "status",

    //   render(row, record) {
    //     return "已注册";
    //   },
    // },
    // {
    //   title: "操作",
    //   render(row, record) {
    //     return (
    //       <a
    //       // onClick={() => {
    //       //   onViewWorkUnit && onViewWorkUnit(record.id!);
    //       // }}
    //       >
    //         角色更改
    //       </a>
    //     );
    //   },
    // },
  ];

  return (
    <div style={{ paddingTop: 12 }}>
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
}
