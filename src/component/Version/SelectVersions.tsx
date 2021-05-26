import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { VersionVO } from "api/generated/model";
import { orderBy, first, size, clone } from "lodash";
import { Tag, Select } from "antd";

interface SelectVersionProps {
  workUnitType?: string;
  versions: VersionVO[];
  onVersionSelected: (version: VersionVO | null) => void;
}

interface VersionsState {
  versions: VersionVO[];
  selectedVersion: VersionVO | null;
}

export function SelectVersions(props: SelectVersionProps) {
  const { versions: sVersions, onVersionSelected } = props;
  const [{ selectedVersion, versions }, updateState] = useImmer<VersionsState>({
    versions: [],
    selectedVersion: null,
  });

  useEffect(() => {
    updateState((draft) => {
      const sortedVersions = orderBy(sVersions, "version").reverse();
      draft.versions = sortedVersions;
      const defaultVersion = first(sortedVersions) ?? null;
      draft.selectedVersion = defaultVersion;
      onVersionSelected(defaultVersion);
    });

    return () =>
      updateState((draft) => {
        draft.selectedVersion = null;
      });
  }, [sVersions]);

  if (size(versions) === 0) {
    return <span>无数据</span>;
  }

  const non0Versions = versions.filter((v) => v.version !== 0);
  if (size(non0Versions) === 0) {
    return <span style={{ marginLeft: 12 }}>-</span>;
  }
  return (
    <Select
      size="small"
      value={selectedVersion?.version ?? 0}
      disabled={non0Versions === null}
      dropdownClassName="select-version-dropdown"
      bordered={false}
      onChange={(value) => {
        updateState((draft) => {
          const version =
            non0Versions?.find((v) => v.version === value) ?? null;
          onVersionSelected(version ?? null);
          draft.selectedVersion = version;
        });
      }}
    >
      {non0Versions &&
        clone(non0Versions).map((version) => (
          <Select.Option key={version.version} value={version.version!}>
            {version.status === "WIP" ? (
              <span className="small-version">{version.displayVersion}</span>
            ) : (
              <span>{version.displayVersion}</span>
            )}
          </Select.Option>
        ))}
    </Select>
  );
}
