import React, { useContext } from "react";
import { useRecoilValue } from "recoil";
import { teamByIdSelector } from "state/project.state";
import ProjectPageContext from "../ProjectPageContext";

export interface ProjectTeamNameProps {
  id: string;
  unknownText?: string;
}

export interface State {}

export default function ProjectTeamName(props: ProjectTeamNameProps) {
  const { id, unknownText } = props;
  const team = useRecoilValue(teamByIdSelector(id));
  const { onUserNotFound } = useContext(ProjectPageContext);

  if (!id) {
    return <span>{unknownText ?? ""}</span>;
  }

  if (!team) {
    onUserNotFound(id);
  }

  return <span>{team?.name}</span>;
}
