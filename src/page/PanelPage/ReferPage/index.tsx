/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useContext, useEffect, ReactText } from "react";
import PanelTabTitle from "component/PanelTabTitle";
import { teamService } from "service";
import { remove } from "lodash";
import { useImmer } from "use-immer";
import {
  VersionVO,
  DataSetVO,
  Team,
  ShareRecordVOStatusEnum,
} from "api/generated/model";
import FakeProgress from "component/FakeProgress";
import panelService from "service/panel.service";
import WorkUnitTree from "component/WorkUnitTree";
import Loading from "component/Loading";
import {
  CompassFilled,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import {
  useWorkUnitListByProjectId,
  useVersionListByWorkUnits,
} from "hook/use-work-unit-service.hook";
import { usePermissions } from "hook/use-permission.hook";
import { useShareRecordsWithoutUserName } from "hook/use-share-service.hook";
import { version } from "punycode";
import { Dropdown, Menu, message, Button } from "antd";
import qwebService from "service/qweb.service";
import { publishEvent } from "function/stats.func";
import { specialtyTypeName } from "AppPanel";
import { QTResponse } from "../model";
import ReferDetail from "./ReferDetail";
import PanelPageContext from "../PanelPageContext";

export interface ReferedVersionVO extends VersionVO {
  checkedDataCodeKeys?: ReactText[];
}
interface ReferPageProps {
  activeKey: string;
}

interface ReferedData {
  datasetid: string;
  version: number;
  linkedtypename: string;
  datacodes: string[];
  visible: boolean;
}
interface referedDataResponse {
  linkedworkunits: ReferedData[];
}

interface ReferPageState {
  teams: Team[];
  versions: { [workUnitId: string]: VersionVO[] } | null;
  selectedVersions: { [workUnitId: string]: VersionVO | null };
  datasets: { [teamId: string]: DataSetVO[] } | null;
  openedTeamIds: string[];
  currentDataSet?: DataSetVO;
  currentVersion?: ReferedVersionVO;
  referedVersions: ReferedVersionVO[];
  hidedDataSetIds: string[];
}
export default function ReferPage(props: ReferPageProps) {
  const { activeKey } = props;
  const [
    {
      versions,
      datasets,
      teams,
      currentDataSet,
      currentVersion,
      referedVersions,
      hidedDataSetIds,
    },
    updateState,
  ] = useImmer<ReferPageState>({
    versions: null,
    datasets: null,
    selectedVersions: {},
    teams: [],
    openedTeamIds: [],
    referedVersions: [],
    hidedDataSetIds: [],
  });
  const {
    projectId,
    workUnit,
    referingVersionIds,
    refreshCount,
    workunitReadonly,
    specialtyType,
    setReferedVersions,
    setReferingVersionIds,
    setReferWorkUnits,
  } = useContext(PanelPageContext);
  const {
    workUnits: allWorkUnits,
    loading,
    refresh: refreshAllWorkUnit,
  } = useWorkUnitListByProjectId(projectId ?? undefined);
  const {
    records: consumedData,
    loading: loadingConsumedData,
    refresh: refreshShareRecords,
  } = useShareRecordsWithoutUserName({
    consumeId: workUnit?.teamId!,
    status: [ShareRecordVOStatusEnum.Consumed],
  });
  const {
    permissions,
    loading: loadingPermissions,
    refresh: refreshPermissions,
  } = usePermissions(workUnit?.teamId!, "TrustBy");
  const {
    versions: allVersions,
    loading: loadingVersions,
    refresh: refreshVersions,
  } = useVersionListByWorkUnits(allWorkUnits, "committed");

  useEffect(() => {
    updateState((draft) => {
      draft.referedVersions = [];
      draft.hidedDataSetIds = [];
    });
  }, [workUnit?.id]);
  useEffect(() => {
    const subscription = qwebService.subscribe((e) => {
      console.log("received qt event: ", e);
      switch (e.CollaborationClientEvent.actionname) {
        case "linkedworkunitdeleted":
          // message.info("工作单元已关闭");
          updateState((draft) => {
            draft.referedVersions = referedVersions.filter(
              (referedVersion) =>
                referedVersion.dataSetId !==
                e.CollaborationClientEvent.arguments?.datasetid,
            );
          });
          break;
        default:
          break;
      }
    });
    setReferedVersions(referedVersions);
    return () => {
      subscription?.unsubscribe();
    };
  }, [referedVersions]);
  const prepareData = async () => {
    if (projectId) {
      const newTeams = await teamService.listTeams(projectId);
      updateState((draft) => {
        draft.teams = newTeams!;
        draft.openedTeamIds = newTeams ? newTeams.map((team) => team.id!) : [];
      });
    }
  };

  useEffect(() => {
    if (workUnit?.id) {
      prepareData();
    }
  }, [projectId, workUnit?.id]);
  const init = () => {
    prepareData();
    refreshVersions();
    refreshAllWorkUnit();
    refreshPermissions();
    refreshShareRecords();
  };
  const refreshReferedVersions = () => {
    workUnit &&
      allVersions &&
      panelService.getlinkedworkunits(workUnit?.id!).then((data: any) => {
        updateState((draft) => {
          draft.referedVersions = [
            ...referedVersions,
            ...(data?.linkedworkunits
              ?.filter(
                (item: ReferedData) =>
                  !referedVersions.some(
                    (version) => version?.dataSetId === item.datasetid,
                  ),
              )
              .map((item: ReferedData) => ({
                ...(allVersions.find(
                  (version) =>
                    version.dataSetId === item.datasetid &&
                    version.version === item.version,
                ) || {}),
                dataSetId: item.datasetid,
                checkedDataCodeKeys: item.datacodes,
              })) ?? []),
          ];
          draft.hidedDataSetIds = [
            ...hidedDataSetIds,
            ...(data?.linkedworkunits
              ?.filter(
                (item: ReferedData) =>
                  !hidedDataSetIds.some(
                    (dataSetId) => dataSetId === item.datasetid,
                  ) && !item.visible,
              )
              .map((item: ReferedData) => item.datasetid) ?? []),
          ];
        });
      });
  };
  // useEffect(() => {
  //   if (activeKey === "2") {
  //     try {
  //       init();
  //     } catch (err) {
  //       message.error(err);
  //     }
  //   }
  // }, [activeKey]);
  useEffect(() => {
    try {
      init();
    } catch (err) {
      message.error(err);
    }
  }, [refreshCount, workUnit?.id, activeKey]);
  useEffect(() => {
    try {
      refreshReferedVersions();
    } catch (err) {
      message.error(err);
    }
  }, [workUnit?.id, allVersions]);
  useEffect(() => {
    if (
      teams?.length > 0 &&
      consumedData &&
      allWorkUnits?.length > 0 &&
      permissions &&
      allVersions?.length > 0
    ) {
      updateState((draft) => {
        const selectWorkUnits = allWorkUnits.filter(
          (unit) =>
            !(
              unit.name === workUnit?.name && unit.teamId === workUnit?.teamId
            ) && // Todo 排除自己
            !(
              unit.type === "workunit" ||
              (unit.teamId !== workUnit?.teamId &&
                !permissions.some(
                  (permission) => permission.teamId === unit.teamId,
                ) &&
                !consumedData.some((data) =>
                  data.contents?.some(
                    (content) => content.dataSetId === unit.id,
                  ),
                ))
            ),
        );
        setReferWorkUnits(selectWorkUnits);
        draft.datasets = selectWorkUnits.reduce(
          (result: { [teamId: string]: DataSetVO[] }, workUnit) => {
            if (!result[workUnit.teamId!]) {
              result[workUnit.teamId!] = [];
            }
            result[workUnit.teamId!].push(workUnit);
            return result;
          },
          {},
        );
        const initVersions: { [workUnitId: string]: VersionVO[] } = {};
        draft.versions = selectWorkUnits.reduce(
          (result, unit) => ({
            ...result,
            [unit.id!]: allVersions.filter(
              (version) =>
                version?.version &&
                version?.dataSetId === unit.id &&
                (unit.teamId !== workUnit?.teamId &&
                !permissions.some(
                  (permission) => permission.teamId === unit.teamId,
                )
                  ? consumedData?.some((data) =>
                      data.contents?.some(
                        (content) => version.id === content.id,
                      ),
                    )
                  : true),
            ),
          }),
          initVersions,
        );
      });
    }
  }, [teams, consumedData, allWorkUnits, permissions, allVersions]);
  const onReferCommit = (checkedKeys: ReactText[]) => {
    const findedIndex = referedVersions.findIndex(
      (version) =>
        version.id === currentVersion?.id ||
        (version?.dataSetId === currentVersion?.dataSetId &&
          version?.version === currentVersion?.version),
    );

    if (checkedKeys && checkedKeys.length) {
      publishEvent("referWorkUnit", ["工具"], {
        from: specialtyTypeName[specialtyType],
        query: checkedKeys.includes("all") ? "全部" : "部分",
      });
      setReferingVersionIds([...referingVersionIds, currentVersion?.id!]);
      panelService
        .linkworkunit(
          currentDataSet?.id!,
          currentVersion?.version!,
          currentDataSet?.name!,
          Array.from(new Set(checkedKeys.join(",").split(","))),
        )
        .then((result) => {
          const newReferedVersion = {
            ...currentVersion,
            checkedDataCodeKeys: checkedKeys,
          };
          updateState((draft) => {
            if (findedIndex === -1) {
              draft.referedVersions = [...referedVersions, newReferedVersion];
            } else {
              draft.referedVersions = referedVersions.map((referedVersion, i) =>
                i === findedIndex ? newReferedVersion : referedVersion,
              );
            }
            draft.hidedDataSetIds = hidedDataSetIds.filter(
              (dataSetId) => dataSetId !== currentVersion?.dataSetId!,
            );
          });
          setReferingVersionIds(
            referingVersionIds.filter(
              (versionId) => versionId !== currentVersion?.id!,
            ),
          );
        });
    } else if (findedIndex !== -1) {
      updateState((draft) => {
        draft.referedVersions = referedVersions.filter(
          (version, index) => index !== findedIndex,
        );
      });
    }
    updateState((draft) => {
      draft.currentDataSet = undefined!;
      draft.currentVersion = undefined;
    });
  };
  const onActionClick = (
    key: string,
    dataSet: DataSetVO,
    version: ReferedVersionVO,
  ) => {
    switch (key) {
      case "update":
        if (versions) {
          panelService
            .updatelinkedworkunit(
              dataSet.id!,
              versions[dataSet.id!][0]?.version!,
            )
            .then(() => {
              updateState((draft) => {
                const newReferedVersions = referedVersions.filter(
                  (referedVersion) =>
                    referedVersion.id !== version.id &&
                    !(
                      version?.dataSetId === referedVersion?.dataSetId &&
                      version?.version === referedVersion?.version
                    ),
                );
                newReferedVersions.push(versions[dataSet.id!][0]);
                draft.referedVersions = newReferedVersions;
                draft.versions = {
                  ...versions,
                  [dataSet.id!]: [...versions[dataSet.id!]],
                };
              });
            });
        }
        break;
      case "reSelect":
        updateState((draft) => {
          draft.currentDataSet = dataSet!;
          draft.currentVersion = {
            ...version,
            checkedDataCodeKeys: referedVersions.find(
              (v) => v.dataSetId === dataSet.id,
            )?.checkedDataCodeKeys,
          };
        });
        break;
      case "delete":
        panelService.deletelinkedworkunit(dataSet.id!).then(() => {
          updateState((draft) => {
            draft.referedVersions = referedVersions.filter(
              (referedVersion) =>
                referedVersion.id !== version.id &&
                !(
                  version?.dataSetId === referedVersion?.dataSetId &&
                  version?.version === referedVersion?.version
                ),
            );
          });
        });
        break;
    }
  };
  if (loading || loadingConsumedData || loadingPermissions || loadingVersions) {
    return <Loading absolute />;
  }
  return (
    <div className="panel-body">
      <div className="title">
        <PanelTabTitle
          title="可选参照"
          tip="你可以通过链接一个其他人的工作单元，作为自己的设计参照"
        />
      </div>
      <WorkUnitTree
        teams={teams}
        datasets={datasets}
        versions={versions}
        referedVersions={referedVersions}
        versionDisabled={(dataSet, version) =>
          referedVersions.some(
            (referedVersion) =>
              referedVersion?.id === version?.id ||
              (version?.dataSetId === referedVersion?.dataSetId &&
                version?.version === referedVersion?.version),
          )
        }
        nodeSelected={(dataSet, version) =>
          referedVersions.some(
            (referedVersion) =>
              referedVersion?.id === version?.id ||
              (version?.dataSetId === referedVersion?.dataSetId &&
                version?.version === referedVersion?.version),
          )
        }
        preIconRender={(dataSet, version) => {
          const findedReferedVersion = referedVersions.find(
            (referedVersion) =>
              referedVersion.id === version?.id ||
              (version?.dataSetId === referedVersion?.dataSetId &&
                version?.version === referedVersion?.version),
          );
          return (
            !referingVersionIds.includes(version?.id!) &&
            findedReferedVersion &&
            (hidedDataSetIds.includes(dataSet?.id!) ? (
              <EyeInvisibleOutlined
                onClick={async () => {
                  await panelService.showlinkedworkunit(dataSet.id!);
                  updateState((draft) => {
                    draft.hidedDataSetIds = hidedDataSetIds.filter(
                      (id) => dataSet.id !== id,
                    );
                  });
                }}
              />
            ) : (
              <EyeOutlined
                onClick={async () => {
                  await panelService.hidelinkedworkunit(dataSet.id!);
                  updateState((draft) => {
                    draft.hidedDataSetIds = [...hidedDataSetIds, dataSet.id!];
                  });
                }}
              />
            ))
          );
        }}
        bottomActionRender={(dataSet, version) => {
          const findedReferedVersion = referedVersions.find(
            (referedVersion) =>
              referedVersion.id === version?.id ||
              (version?.dataSetId === referedVersion?.dataSetId &&
                version?.version === referedVersion?.version),
          );
          const maxVersion =
            version?.dataSetId && versions?.[version?.dataSetId]?.[0]?.version;
          const nowVersion = version?.version;
          return (
            !referingVersionIds.includes(version?.id!) &&
            findedReferedVersion && (
              <>
                {maxVersion && nowVersion && maxVersion > nowVersion && (
                  <Button
                    type="link"
                    shape="circle"
                    disabled={workunitReadonly}
                    onClick={() => onActionClick("update", dataSet, version)}
                    size="small"
                  >
                    更新
                  </Button>
                )}
                <Button
                  type="link"
                  disabled={workunitReadonly}
                  shape="circle"
                  onClick={() => onActionClick("reSelect", dataSet, version)}
                  size="small"
                >
                  重新筛选
                </Button>
                <Button
                  type="link"
                  shape="circle"
                  disabled={workunitReadonly}
                  onClick={() => onActionClick("delete", dataSet, version)}
                  size="small"
                >
                  删除
                </Button>
              </>
            )
          );
        }}
        actionRender={(dataSet, version) => {
          const findedReferedVersion = referedVersions.some(
            (referedVersion) =>
              referedVersion.id === version?.id ||
              (version?.dataSetId === referedVersion?.dataSetId &&
                version?.version === referedVersion?.version),
          );
          return referingVersionIds.includes(version?.id!) ? (
            <FakeProgress
              completed={false}
              showInfo={false}
              width={20}
              onCompleted={() => {
                setReferingVersionIds(
                  referingVersionIds.filter(
                    (versionId) => versionId !== version.id,
                  ),
                );
              }}
            />
          ) : (
            <Button
              size="small"
              style={{ fontSize: 12, padding: "0px 4px", minWidth: "auto" }}
              disabled={workunitReadonly || findedReferedVersion}
              onClick={() => {
                updateState((draft) => {
                  draft.currentDataSet = dataSet!;
                  draft.currentVersion = version;
                });
              }}
            >
              参照
            </Button>
          );
        }}
      />
      <ReferDetail
        onCommit={onReferCommit}
        visible={!!currentDataSet && !!currentVersion}
        dataSet={currentDataSet}
        version={currentVersion}
        onClose={() => {
          updateState((draft) => {
            draft.currentDataSet = undefined!;
            draft.currentVersion = undefined;
          });
        }}
      />
    </div>
  );
}
