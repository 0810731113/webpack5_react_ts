import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { SelectProps } from "antd/lib/select";
import { useImmer } from "use-immer";
import { Team, User } from "api/generated/model";
import { Select } from "antd";
import { applyService, enterpriseService } from "service";
import { EnterpriseMember } from "api-auth/generated/model";

const { Option, OptGroup } = Select;

interface EnterpriseUserSelectProps extends SelectProps<any> {
  onUserChange?: (user: EnterpriseMember) => void;
  users?: User[];
  currentUsers?: User[];
  disabledText: string;
}

interface State {
  members: EnterpriseMember[];
}

export default function EnterpriseUserSelect(props: EnterpriseUserSelectProps) {
  const { onUserChange, onChange, users, currentUsers, disabledText } = props;
  const [{ members }, updateState] = useImmer<State>({ members: [] });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    enterpriseService.getSubAccountsWithMain().then((members) => {
      updateState((draft) => void (draft.members = members));
    });
  }, []);

  return (
    <Select
      showSearch
      style={{ width: "100%" }}
      placeholder="选择账号"
      optionFilterProp="children"
      filterOption={(input, option) => option?.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0}
      onChange={(v, option) => {
        const selectedUser = members?.find((user) => user.userId === v);
        onChange?.(v, option);
        if (selectedUser && onUserChange) {
          onUserChange(selectedUser!);
        }
      }}
    >
      <OptGroup label="可选账号">
        {members
          .filter((mem) => !users?.some((user) => user.id === mem.userId!))
          .map((mem) => <Option value={mem.userId!}>{mem.userName}</Option>)}
      </OptGroup>
      <OptGroup label={disabledText}>
        {users?.map((user) => <Option value={user.id!} disabled>{user.name}</Option>)}
      </OptGroup>

      {/* {members.map((mem) => {
        if (users?.some((user) => user.id === mem.userId!)) {
          return (
            <Option value={mem.userId!} disabled>
              {`${mem.userName}${disabledText}`}
            </Option>
          );
        } else {
          return <Option value={mem.userId!}>{mem.userName}</Option>;
        }
      })} */}
    </Select>
  );
}
