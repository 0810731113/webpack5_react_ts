import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import Iconfont from "component/Iconfont";
import { Button, Checkbox, Select, Tabs, message, Modal } from "antd";
import { roleService } from "service";
import { RoleName, RoleDescription, ProjectRole } from "service/role.service";
import consts from "consts";
import PermissionDetails from "./Permission/PermissionDetails";

const { PUBLIC_URL } = consts;

const Roles: ProjectRole[] = [
  ProjectRole.ProjectAdmin,
  ProjectRole.ProjectUser,
];

interface RoleSettingsPageProps {}

interface State {
  selectedRole: ProjectRole;
  activeTab: string;
}

export default function RoleSettingsPage(props: RoleSettingsPageProps) {
  const {} = props;
  const [{ selectedRole, activeTab }, updateState] = useImmer<State>({
    selectedRole: ProjectRole.ProjectAdmin,
    activeTab: "details",
  });

  return (
    <>
      <div className="sidebar">
        <section>
          <div className="title">
            <Iconfont type="icon-changguitubiao-liebiao" />
            角色列表
          </div>
          <ul>
            {Roles.map((role) => (
              <li key={role} className={selectedRole === role ? "active" : ""}>
                <a
                  onClick={() => {
                    updateState((draft) => {
                      draft.selectedRole = role;
                    });
                  }}
                >
                  {RoleName[role]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="sub-page">
        <div className="page-header">
          <div className="role">
            <div className="role-name">{RoleName[selectedRole]}</div>
            <div className="role-description">
              {RoleDescription[selectedRole]}
            </div>
          </div>
          {/* <div className="img-area">
            <img src={`${PUBLIC_URL}/role.png`} height={100} />
          </div> */}
        </div>
        <div className="page-body">
          <PermissionDetails role={selectedRole} />
        </div>
      </div>
    </>
  );
}
