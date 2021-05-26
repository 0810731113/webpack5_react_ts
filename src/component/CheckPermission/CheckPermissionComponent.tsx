import React, { cloneElement, PropsWithChildren } from "react";
import { ProjectRole } from "service/role.service";
import { useRecoilValue, useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";

interface Props {
  resouseType: ResourcePermissionResourceEnum;
  writeableHtml: React.ReactElement;
  readonlyHtml: React.ReactElement;
}

export function CheckPermissionComponent(props: Props) {
  const { writeableHtml, readonlyHtml, resouseType } = props;
  const [{ roles, resources }] = useRecoilState(projectPageState);

  const rights = resources.find((r) => r.resource === resouseType)
    ?.permissionTypes;

  const writeable =
    rights && rights.includes(ResourcePermissionPermissionTypesEnum.Write);

  const readonly =
    rights && rights.includes(ResourcePermissionPermissionTypesEnum.SoftWrite);

  if (roles.includes(ProjectRole.ProjectAdmin)) {
    return writeableHtml;
  }

  if (writeable) {
    return writeableHtml;
  }

  if (readonly) {
    return readonlyHtml;
  }

  return null;
}
