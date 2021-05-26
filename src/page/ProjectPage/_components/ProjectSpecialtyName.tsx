import React, { useContext } from "react";
import { useRecoilValue } from "recoil";
import { specialtyByIdSelector } from "state/project.state";
import ProjectPageContext from "../ProjectPageContext";

export interface ProjectSpecialtyNameProps {
  id: string;
  unknownText?: string;
}

export interface State {}

export default function ProjectSpecialtyName(props: ProjectSpecialtyNameProps) {
  const { id, unknownText } = props;
  const specialty = useRecoilValue(specialtyByIdSelector(id));
  const { onUserNotFound } = useContext(ProjectPageContext);

  if (!id) {
    return <span>{unknownText ?? ""}</span>;
  }

  if (!specialty) {
    onUserNotFound(id);
  }

  return <span>{specialty?.name}</span>;
}
