import React, { useContext } from "react";
import { RoleName, ProjectRole } from "service/role.service";

export interface ProjectRolesNameProps {
  roles: Array<"ProjectAdmin" | "ProjectUser" | "ProjectExternalUser">;
  unknownText?: string;
}

export interface State {}

export default function ProjectRolesName(props: ProjectRolesNameProps) {
  const { roles, unknownText } = props;

  let str = "";
  if (roles instanceof Array && roles.length > 0) {
    str = RoleName[roles[0]];
    for (let i = 1; i < roles.length; i++) {
      str += `、${RoleName[roles[i]]}`;
    }
  }

  return <span>{str}</span>;
}
