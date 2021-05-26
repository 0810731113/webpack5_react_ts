import { User } from "api/generated/model";
import React, { useContext } from "react";
import { useRecoilValue } from "recoil";
import { userByIdSelector } from "state/project.state";
import { trim } from "lodash";
import ProjectPageContext from "../ProjectPageContext";

export interface ProjectUserNameProps {
  id: string;
  unknownText?: string;
}

export interface State {}

export default function ProjectUserName(props: ProjectUserNameProps) {
  const { id, unknownText } = props;
  const user = useRecoilValue(userByIdSelector(id));
  const { onUserNotFound } = useContext(ProjectPageContext);

  if (!trim(id)) {
    return <span>{unknownText ?? ""}</span>;
  }

  if (!user) {
    onUserNotFound(id);
  }

  return <span>{user?.name}</span>;
}
