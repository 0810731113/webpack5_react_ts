import { InfoCircleFilled } from "@ant-design/icons";
import {
  Empty,
  message,
  Space,
  Tag,
  Button,
  Tooltip,
  Modal,
  Result,
} from "antd";
import { DataSetVO, Team, VersionVO } from "api/generated/model";
import { Select, SelectOption } from "component/Antd";
import PanelTabTitle from "component/PanelTabTitle";
import WorkUnitTree from "component/WorkUnitTree";
import { clone, first, orderBy, size, isNumber } from "lodash";
import React, { useContext, useEffect, Fragment } from "react";
import {
  teamService,
  workUnitService,
  specialtyService,
  versionService,
  authService,
  roleService,
} from "service";
import panelService from "service/panel.service";
import { useImmer } from "use-immer";
import "./SelectWorkUnitPage.scss";
import consts, { IS_MAC, TALKING_DATA_URL } from "consts";
import { mapWorkUnitBySpecialtyIdToTeam } from "function/workUnit.func";
import FakeProgress from "component/FakeProgress";
import qwebService from "service/qweb.service";
import { ProjectRole } from "service/role.service";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { CheckPermissionPanel } from "component/CheckPermission/CheckPermissionPanel";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { publishEvent } from "function/stats.func";
import { specialtyTypeName } from "AppPanel";
import PanelPageContext from "../PanelPageContext";

const { PUBLIC_URL } = consts;
interface SelectWorkUnitPageProps {
  activeKey: string;
}

interface State {
  teams: Team[];
  versions: { [workUnitId: string]: VersionVO[] } | null;
  selectedVersions: { [workUnitId: string]: VersionVO | null };
  datasets: { [teamId: string]: DataSetVO[] } | null;
  openedTeamIds: string[];
  blocked: boolean;
}

export default function SelectWorkUnitPage({
  activeKey,
}: SelectWorkUnitPageProps) {
  const [
    { versions, selectedVersions, datasets, teams, openedTeamIds, blocked },
    updateState,
  ] = useImmer<State>({
    versions: null,
    datasets: null,
    selectedVersions: {},
    teams: [],
    openedTeamIds: [],
    blocked: false,
  });

  const {
    projectId,
    workUnit,
    workUnits,
    specialtyType,
    savingWorkUnit,
    currentOperatingWorkUnitId,
    commitingWorkUnit,
    openingWorkUnit,
    refreshCount,
    workunitReadonly,
    showprocess,
    setWorkUnit,
    setWorkUnits,
    setVersion,
    setProjectId,
    setCurrentOperationWorkUnitId,
    setOpeningWorkUnit,
    setSavingWorkUnit,
    setCommitingWorkUnit,
    setSpecialties,
    setWorkunitReadonly,
  } = useContext(PanelPageContext);

  useEffect(() => {
    const subscription = qwebService.subscribe((e) => {
      console.log("received qt event: ", e);
      // try {
      switch (e.CollaborationClientEvent.actionname) {
        case "saveworkunit":
          if (workUnit && workUnit.id) {
            setCurrentOperationWorkUnitId(workUnit.id);
            publishEvent("saveWorkUnit", ["工具"], {
              from: specialtyTypeName[specialtyType],
            });
          }
          setSavingWorkUnit(true);
          break;
        case "commitworkunit":
          if (workUnit && workUnit.id) {
            setCurrentOperationWorkUnitId(workUnit.id);
            publishEvent("commitWorkUnit", ["工具"], {
              from: specialtyTypeName[specialtyType],
            });
          }
          setCommitingWorkUnit(true);
          break;
        case "openinglatelyworkunit":
          const { projectid, datasetid } = e.CollaborationClientEvent.arguments;
          if (projectid) {
            setProjectId(projectid);
          }
          if (datasetid) {
            setCurrentOperationWorkUnitId(datasetid);
          }
          setOpeningWorkUnit(true);
          break;
        case "openedlatelyworkunit":
          const {
            projectid: openedProjectid,
            datasetid: openedDatasetid,
            status,
          } = e.CollaborationClientEvent.arguments;
          if (openedProjectid) {
            setProjectId(openedProjectid);
          }
          if (openedDatasetid) {
            setCurrentOperationWorkUnitId(openedDatasetid);
          }
          if (openedDatasetid && status !== "error") {
            versionService.getLatestVersion(openedDatasetid).then((version) => {
              if (
                version &&
                isNumber(version.version) &&
                version.verifyStatus !== "illegal"
              ) {
                const ds = workUnits?.find(
                  (dataset) => dataset.id === openedDatasetid,
                ) || { id: openedDatasetid };
                if (ds) {
                  setWorkUnit(ds);
                }
                setVersion(version);
                setWorkunitReadonly(status === "readonly");
              }
            });
          }
          setOpeningWorkUnit(false);
          setCurrentOperationWorkUnitId(null);
          break;

        default:
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [workUnit]);

  const prepareData = async () => {
    if (projectId) {
      let currentSpecialtyId = null;

      // 拿专业
      if (specialtyType) {
        const specialties = await specialtyService
          .querySepcialty(projectId)
          .catch(() => {
            console.error("error in getting specialty");
            return null;
          });
        setSpecialties(specialties);

        const currentSpecialty = specialties?.find(
          (specialty) => specialty.type === specialtyType,
        );
        currentSpecialtyId = currentSpecialty?.id;
      }

      // workaround
      if (!currentSpecialtyId) {
        return;
      }

      // 拿团队
      const newTeams = await teamService.listMyTeam(projectId).catch(() => {
        console.error("error in getting teams");
        return null;
      });

      updateState((draft) => {
        draft.teams = newTeams!;
        draft.openedTeamIds = newTeams?.map((team) => team.id!) || [];
      });

      // 拿工作单元和版本
      if (newTeams instanceof Array && newTeams.length > 0) {
        const teamIds = newTeams.map((team) => team.id!);
        const newDatasets = await workUnitService
          .getBatchPanelWorkUnitsByTeamId(teamIds)
          .catch(() => {
            console.error("error in getting teams");
            return [];
          });
        // datasets = datasets.filter(
        //   (workUnit) => workUnit.ownerId === authService.getUserId(),
        // );
        const datasetsVO = mapWorkUnitBySpecialtyIdToTeam(
          newDatasets,
          currentSpecialtyId,
        );
        setWorkUnits(newDatasets);
        if (workUnit?.id) {
          const ds = workUnits?.find(
            (dataset) => dataset.id === currentOperatingWorkUnitId,
          );
          if (ds) {
            setWorkUnit({ ...ds });
          }
        }

        updateState((draft) => {
          draft.datasets = datasetsVO;
        });

        const dsIds = Object.values(datasetsVO)
          .flat()
          .map((dataset) => dataset.id!);

        if (dsIds instanceof Array && dsIds.length > 0) {
          const newVersions = await workUnitService
            .batchLoadWorkUnitsVersions(dsIds)
            .catch(() => {
              console.error("error in getting teams");
              return null;
            });

          updateState((draft) => {
            draft.versions = newVersions;
          });
        }
      }
    }
  };

  useEffect(() => {
    if (projectId) {
      roleService.getMyRole(projectId).then((roles) => {
        if (
          roles?.length === 1 &&
          roles[0] === ProjectRole.ProjectExternalUser
        ) {
          updateState((draft) => {
            draft.blocked = true;
          });
        } else {
          updateState((draft) => {
            draft.blocked = false;
          });
          prepareData();
        }
      });
    } else {
      updateState((draft) => {
        draft.teams = [];
      });
    }
  }, [projectId, specialtyType]);
  useEffect(() => {
    if (workUnit?.id) {
      const currentWorkunit = workUnits?.find(
        (unit) => unit.id === workUnit.id,
      );
      if (
        currentWorkunit &&
        JSON.stringify(currentWorkunit) !== JSON.stringify(workUnit)
      ) {
        setWorkUnit(currentWorkunit);
      }
    }
  }, [workUnits]);

  useEffect(() => {
    if (!savingWorkUnit) {
      prepareData();
    }
  }, [savingWorkUnit]);

  useEffect(() => {
    if (!commitingWorkUnit) {
      prepareData();
    }
  }, [commitingWorkUnit]);

  useEffect(() => {
    if (["1", "2"].includes(activeKey)) {
      prepareData();
    }
  }, [activeKey, refreshCount]);

  if (projectId === null) {
    return (
      <div className="empty-wrap">
        <Empty
          description={
            <Space direction="vertical">
              <span>请选择项目</span>
            </Space>
          }
        />
      </div>
    );
  }

  if (blocked) {
    return (
      <Empty
        description={
          <>
            <div>暂不支持外部成员查看项目</div>
            <div style={{ opacity: 0.21, fontSize: 12 }}>
              如需查看，请联系项目管理员修改权限
            </div>
          </>
        }
        image={`${PUBLIC_URL}/panel_blocked.svg`}
        style={{ marginTop: 48 }}
      />
    );
  }

  // if (!teams || teams.length === 0) {
  //   return (
  //     <Empty
  //       description={
  //         <Space direction="vertical">
  //           <span>暂无数据</span>
  //         </Space>
  //       }
  //     />
  //   );
  // }

  function saveWorkUnit() {
    if (workUnit && workUnit.id) {
      setCurrentOperationWorkUnitId(workUnit.id);
      publishEvent("saveWorkUnit", ["工具"], {
        from: specialtyTypeName[specialtyType],
      });
    }

    setSavingWorkUnit(true);
    panelService.saveWorkUnit(showprocess);
  }

  function commitWorkUnit() {
    if (workUnit && workUnit.id) {
      setCurrentOperationWorkUnitId(workUnit.id);
      publishEvent("commitWorkUnit", ["工具"], {
        from: specialtyTypeName[specialtyType],
      });
    }
    setCommitingWorkUnit(true);
    panelService.commitWorkUnit(showprocess);
  }

  function selectWorkUnit(ds: DataSetVO) {
    if (workUnit) {
      if (workUnit.id === ds.id) {
        message.info("当前工作单元已打开");
        return;
      }
      message.warn("请先关闭当前工作单元");
      return;
    }

    if (ds.id) {
      prepareData();
      setCurrentOperationWorkUnitId(ds.id);
      setOpeningWorkUnit(true);

      versionService.getLatestVersion(ds.id).then((version) => {
        if (
          version &&
          isNumber(version.version) &&
          version.verifyStatus !== "illegal"
        ) {
          panelService
            .openWorkUnit(ds.id!, version.version)
            .then((res: any) => {
              setWorkUnit(ds);
              setVersion(version);
              setWorkunitReadonly(!!res.readonly);
            })
            .catch((errornumber) => {
              if (errornumber.toString() === "3") {
                Modal.warning({
                  className: "clean-cache-modal",
                  title: "打开失败，需要清空缓存",
                  width: 280,
                  content: (
                    <div className="content-text">
                      <p>清空缓存方法：</p>
                      <p>
                        1.复制文件夹路径：%localappdata%\Glodon\
                        {specialtyType}
                      </p>
                      <p>
                        2.打开“计算机”，在路径处粘贴链接，找到“dbCache”文件夹
                      </p>
                      <p>3.关闭软件后，再删除“dbCache”文件夹</p>
                    </div>
                  ),
                  okButtonProps: { type: "default" },
                  okText: "确定",
                });
              }

              if (errornumber.toString() === "4") {
                Modal.error({
                  className: "clean-cache-modal",
                  title: "打开失败, 请升级软件",
                  content: (
                    <div className="content-text">
                      <p>此工作单元的数据已升级，请使用最新版本的工具端打开 </p>
                    </div>
                  ),
                  width: 280,
                  okButtonProps: { type: "default" },
                  okText: "确定",
                });
              }
            })
            .finally(() => {
              setOpeningWorkUnit(false);
              setCurrentOperationWorkUnitId(null);
            });
        } else {
          message.error(
            "版本有更新且数据异常，目前无法继续使用，请前往网页端恢复历史版本",
          );
        }
      });
    }
  }

  return (
    <div className="panel-body">
      <div className="title">
        <PanelTabTitle title="工作单元" tip="工作单元" />
      </div>
      <WorkUnitTree
        disabled={!!workUnit || openingWorkUnit}
        teams={teams}
        datasets={datasets}
        versions={versions}
        workUnitId={workUnit?.id}
        versionDisabled={() => true}
        nodeSelected={(dataSet) => dataSet.id === workUnit?.id}
        bottomActionRender={(dataSet, version) => {
          const isloading =
            currentOperatingWorkUnitId === dataSet.id &&
            (savingWorkUnit || commitingWorkUnit || openingWorkUnit);

          const illegal = version && version.verifyStatus === "illegal";

          return workUnit?.id === dataSet.id ? (
            <div>
              <CheckPermissionPanel
                resouseType={ResourcePermissionResourceEnum.PersonalDataset}
              >
                <TooltipWrapper
                  mouseEnterDelay={1}
                  when={(props) => props.disabled ?? false}
                  title="处于示例项目中无该功能权限"
                  defaultTitle="将工作单元保存至“广联达协同设计平台-个人设计"
                >
                  <Button
                    // type="link"
                    // shape="circle"
                    onClick={saveWorkUnit}
                    disabled={
                      workunitReadonly || !workUnit || isloading || illegal
                    }
                    size="small"
                  >
                    保存
                  </Button>
                </TooltipWrapper>
              </CheckPermissionPanel>

              <CheckPermissionPanel
                resouseType={ResourcePermissionResourceEnum.PersonalDataset}
              >
                <TooltipWrapper
                  mouseEnterDelay={1}
                  when={(props) => props.disabled ?? false}
                  title="处于示例项目中无该功能权限"
                  placement="bottomRight"
                  defaultTitle="将工作单元提交至“广联达协同设计平台-团队协同”"
                >
                  <Button
                    // type="link"
                    // shape="circle"
                    onClick={commitWorkUnit}
                    disabled={
                      workunitReadonly || !workUnit || isloading || illegal
                    }
                    size="small"
                  >
                    提交
                  </Button>
                </TooltipWrapper>
              </CheckPermissionPanel>
            </div>
          ) : (
            false
          );
        }}
        actionRender={(dataSet, version) => {
          const isloading =
            currentOperatingWorkUnitId === dataSet.id &&
            (showprocess
              ? openingWorkUnit
              : savingWorkUnit || commitingWorkUnit || openingWorkUnit);

          if (version && version.verifyStatus === "illegal") {
            return (
              <Tooltip
                trigger="hover"
                mouseEnterDelay={1}
                placement="bottom"
                title="非常抱歉，该版本数据似乎出现了问题，目前无法继续使用，请前往网页端恢复历史版本"
              >
                <InfoCircleFilled style={{ color: "#faad14" }} />
              </Tooltip>
            );
          }

          return isloading ? (
            <FakeProgress
              style={{ marginLeft: 9 }}
              completed={false}
              showInfo={false}
              width={20}
              onCompleted={() => {
                console.log("completed");
              }}
            />
          ) : (
            <Button
              size="small"
              style={{ fontSize: 12, padding: "0px 4px", minWidth: "auto" }}
              disabled={!!workUnit || openingWorkUnit}
              onClick={() => selectWorkUnit(dataSet)}
            >
              打开
            </Button>
          );
        }}
      />
    </div>
  );
}
