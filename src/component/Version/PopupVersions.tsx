import {
  Button,
  Divider,
  Empty,
  notification,
  Select,
  Space,
  Tag,
  Tooltip,
  Modal,
  Popover,
  Input,
} from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { DataSetVO, VersionVO } from "api/generated/model";
import { clone, first, orderBy, size, runInContext } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { fileService, workUnitService } from "service";
import { useImmer } from "use-immer";
import VersionList from "./VersionList";

interface PopupVersionsProps {
  versions: VersionVO[];
  onVersionSelected?: (version: VersionVO | null) => void;
  operationRender: (version: VersionVO) => React.ReactNode;
}

interface VersionsState {
  versions: VersionVO[] | null;
  selectedVersion: VersionVO | null;
}

export function PopupVersions(props: PopupVersionsProps) {
  const { versions, onVersionSelected, operationRender } = props;
  const [{ selectedVersion }, updateState] = useImmer<VersionsState>({
    versions,
    selectedVersion: null,
  });

  useEffect(() => {
    updateState((draft) => {
      const sortedVersions = orderBy(versions, "version").reverse();
      draft.versions = sortedVersions;
      const defaultVersion = first(sortedVersions) ?? null;
      draft.selectedVersion = defaultVersion;
      onVersionSelected && onVersionSelected(defaultVersion);
    });

    return () => updateState((draft) => void (draft.selectedVersion = null));
  }, [versions]);

  if (size(versions) === 0) {
    return <span>无数据</span>;
  }

  const non0Versions = versions.filter((v) => v.version !== 0);
  if (size(non0Versions) === 0) {
    return <Tag>空数据</Tag>;
  }
  const content = (
    <VersionList versions={non0Versions} operationRender={operationRender} />
  );
  return (
    <Popover content={content}>
      <Input
        size="small"
        readOnly
        value={`V${versions.length - 1}`}
        style={{ width: 50 }}
      />
    </Popover>
  );
}
