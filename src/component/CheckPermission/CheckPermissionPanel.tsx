import React, { cloneElement, PropsWithChildren, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { ProjectRole } from "service/role.service";
import { useRecoilValue, useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";
import PanelPageContext from "page/PanelPage/PanelPageContext";

interface Props {
  resouseType: ResourcePermissionResourceEnum;
  writeCondition?: (
    rights?: ResourcePermissionPermissionTypesEnum[],
  ) => boolean;
  readCondition?: () => boolean;
}

export function CheckPermissionPanel(props: PropsWithChildren<Props>) {
  const { children, writeCondition, readCondition, resouseType } = props;

  const { resources } = useContext(PanelPageContext);

  const rights = resources.find((r) => r.resource === resouseType)
    ?.permissionTypes;

  // if (resouseType === ResourcePermissionResourceEnum.SharePackage) {
  //   rights = [ResourcePermissionPermissionTypesEnum.Read];
  // }

  const writeable =
    (rights && rights.includes(ResourcePermissionPermissionTypesEnum.Write)) ||
    (writeCondition && writeCondition(rights ?? []));

  const readonly =
    rights && rights.includes(ResourcePermissionPermissionTypesEnum.SoftWrite);

  if (writeable) {
    return <>{children}</>;
  }

  if (readonly) {
    return (
      <>{cloneElement(children as any, { disabled: true, onClick: null })}</>
    );
  }

  return null;
}
