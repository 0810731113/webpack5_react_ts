import React, { useEffect, ReactText } from "react";
import { VersionVO, DataSetVO, Team } from "api/generated/model";
import { useImmer } from "use-immer";
import { clone, first, orderBy, size, remove } from "lodash";
import Loading from "component/Loading";
import { Select, SelectOption } from "component/Antd";
import { Tag, Progress, Space, Empty, Typography } from "antd";
import "./workUnitTree.scss";
import {
  FolderOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  SendOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { ReferedVersionVO } from "page/PanelPage/ReferPage";

interface WorkUnitTreeProps {
  teams: Team[];
  workUnitId?: string;
  datasets: { [teamId: string]: DataSetVO[] } | null;
  versions: { [workUnitId: string]: VersionVO[] } | null;
  disabled?: boolean;
  referedVersions?: ReferedVersionVO[];
  versionDisabled?: (workUnit: DataSetVO, version: VersionVO) => boolean;
  preIconRender?: (workUnit: DataSetVO, version: VersionVO) => React.ReactNode;
  actionRender?: (workUnit: DataSetVO, version: VersionVO) => React.ReactNode;
  bottomActionRender?: (
    workUnit: DataSetVO,
    version: VersionVO,
  ) => React.ReactNode;
  nodeSelected?: (workUnit: DataSetVO, version: VersionVO) => boolean;
}
interface WorkUnitTreeState {
  openedTeamIds: string[];
  selectedVersions: { [workUnitId: string]: VersionVO | null };
}
function Versions(props: VersionsProps) {
  const {
    workUnitType,
    versions,
    onVersionSelected,
    disabled,
    defaultValue,
  } = props;
  const [{ selectedVersion }, updateState] = useImmer<VersionsState>({
    versions,
    selectedVersion: null,
  });
  useEffect(() => {
    updateState((draft) => {
      const sortedVersions = orderBy(versions, "version").reverse();
      draft.versions = sortedVersions;
      const defaultVersion =
        (defaultValue &&
          versions.find((version) => version.version === defaultValue)) ||
        first(sortedVersions) ||
        null;
      draft.selectedVersion = defaultVersion;
      onVersionSelected(defaultVersion);
    });

    return () =>
      updateState((draft) => {
        draft.selectedVersion = null;
      });
  }, [versions, defaultValue]);

  if (size(versions) === 0) {
    return <Tag>空数据</Tag>;
  }

  // const non0Versions = versions.filter((v) => v.version !== 0);
  // if (size(non0Versions) === 0) {
  //   return <Tag>无数据</Tag>;
  // }
  return (
    <Select
      size="small"
      value={selectedVersion?.version ?? 0}
      disabled={disabled}
      style={{ width: 70 }}
      onChange={(value) => {
        updateState((draft) => {
          const version = versions?.find((v) => v.version === value) ?? null;
          onVersionSelected(version ?? null);
          draft.selectedVersion = version;
        });
      }}
    >
      {versions &&
        clone(versions)
          .reverse()
          .map((version) => (
            <SelectOption key={version.version} value={version.version!}>
              {version.displayVersion}
            </SelectOption>
          ))}
    </Select>
  );
}
export default function WorkUnitTree(props: WorkUnitTreeProps) {
  const {
    teams,
    datasets,
    workUnitId,
    versions,
    disabled,
    referedVersions,
    versionDisabled,
    preIconRender,
    actionRender,
    bottomActionRender,
    nodeSelected,
  } = props;
  const [
    { openedTeamIds, selectedVersions },
    updateState,
  ] = useImmer<WorkUnitTreeState>({
    openedTeamIds: [],
    selectedVersions: {},
  });
  useEffect(() => {
    updateState((draft) => {
      draft.openedTeamIds = teams ? teams.map((team) => team.id!) : [];
    });
  }, [teams]);

  if (!teams || teams.length === 0) {
    return (
      <Empty
        description={
          <Space direction="vertical">
            <span>暂无数据</span>
          </Space>
        }
      />
    );
  }

  return (
    <div className={`work-unit-tree  ${disabled ? "line-disabled" : ""}`}>
      {teams
        .filter((team) => datasets && datasets[team.id!])
        .map((team) => {
          let isopen = false;
          if (team && team.id) {
            isopen = openedTeamIds.includes(team.id);
          }

          return (
            <div
              key={team.id}
              className={`team-block ${isopen === false ? "closed" : ""}`}
            >
              <div className="team-name">
                {isopen ? (
                  <CaretDownOutlined
                    onClick={() => {
                      updateState((draft) => {
                        remove(draft.openedTeamIds, (id) => id === team.id);
                      });
                    }}
                  />
                ) : (
                  <CaretRightOutlined
                    onClick={() => {
                      updateState((draft) => {
                        if (team && team.id) {
                          draft.openedTeamIds.push(team.id);
                        }
                      });
                    }}
                  />
                )}

                <span>{team.name}</span>
              </div>
              <div className="team-content">
                {datasets &&
                  datasets[team.id!] &&
                  datasets[team.id!]
                    .filter((dataSet) => versions?.[dataSet.id!]?.length)
                    .map((dataSet) => (
                      <div
                        key={dataSet.id}
                        className={`node ${
                          nodeSelected &&
                          nodeSelected(dataSet, selectedVersions[dataSet.id!]!)
                            ? "selected"
                            : ""
                        }`}
                      >
                        {preIconRender && (
                          <span className="pre-icon">
                            {preIconRender(
                              { ...dataSet, team },
                              selectedVersions[dataSet.id!]!,
                            )}
                          </span>
                        )}
                        <Typography.Text
                          style={{
                            width: 120,
                            margin: 0,
                            overflow: "scroll",
                            marginBottom: -4,
                            // flex: "auto",
                          }}
                          ellipsis={{
                            tooltip: true,
                          }}
                        >
                          {dataSet.name}
                        </Typography.Text>
                        {/* <div className="node-name">{dataSet.name}</div> */}
                        <div className="node-version">
                          {versions ? (
                            <Versions
                              disabled={
                                versionDisabled &&
                                versionDisabled(
                                  { ...dataSet, team },
                                  selectedVersions[dataSet.id!]!,
                                )
                              }
                              defaultValue={
                                referedVersions?.find((referedVersion) =>
                                  versions[dataSet.id!]?.some(
                                    (version) =>
                                      version?.id === referedVersion.id ||
                                      (version.dataSetId ===
                                        referedVersion?.dataSetId &&
                                        version.version ===
                                          referedVersion?.version),
                                  ),
                                )?.version
                              }
                              versions={versions[dataSet.id!]}
                              onVersionSelected={(version) => {
                                updateState((draft) => {
                                  draft.selectedVersions[
                                    version?.dataSetId ?? ""
                                  ] = version;
                                });
                              }}
                            />
                          ) : (
                            <Loading />
                          )}
                        </div>
                        {actionRender && (
                          <div className="node-action">
                            {actionRender(
                              { ...dataSet, team },
                              selectedVersions[dataSet.id!]!,
                            )}
                          </div>
                        )}
                        {bottomActionRender && (
                          <Space className="node-bottom-action">
                            {bottomActionRender(
                              { ...dataSet, team },
                              selectedVersions[dataSet.id!]!,
                            )}
                          </Space>
                        )}
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

interface VersionsProps {
  workUnitType?: string;
  versions: VersionVO[];
  defaultValue?: number;
  onVersionSelected: (version: VersionVO | null) => void;
  disabled?: boolean;
}

interface VersionsState {
  versions: VersionVO[] | null;
  selectedVersion: VersionVO | null;
}
