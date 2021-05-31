import { useRequest } from "@umijs/hooks";
import { DataSetVO, VersionVO, DataSetMonitorVO } from "api/generated/model";
import { publishEvent } from "function/stats.func";
import Loading from "component/Loading";
import WorkUnitList, { VersionStatus } from "component/WorkUnitList";
import { ProjectParams } from "model/route-params.model";
import React, { useEffect, useRef } from "react";
import { workUnitService, authService, xmonitorService } from "service";
import { useImmer } from "use-immer";
import { Space, Modal, Button, Dropdown, Input, message, Form } from "antd";
import { Link, useRouteMatch } from "react-router-dom";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { versionService } from "service";
import { DownOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import EmptyWrapper from "component/EmptyWrapper";
import { ProjectRole } from "service/role.service";
import { onResponseError } from "function/auth.func";
import DraftWorkUnitList from "./DraftWorkUnitList";

export interface DraftWorkUnitListPageProps {}

export interface State {
  workUnits: DataSetVO[] | null;
  versions: { [workUnitId: string]: VersionVO[] };
  monitorList: DataSetMonitorVO[];
}

export default function DraftWorkUnitListPage(
  props: DraftWorkUnitListPageProps,
) {
  const {} = props;
  const [{ workUnits, versions, monitorList }, updateState] = useImmer<State>({
    workUnits: null,
    versions: {},
    monitorList: [],
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [{ roles, currentUser, project }] = useRecoilState(projectPageState);

  const { loading, run } = useRequest(
    () =>
      workUnitService
        .getPersonalWorkUnits(projectId)
        .then((_workUnits) =>
          workUnitService
            .batchLoadWorkUnitsVersions(_workUnits!.map((wu) => wu.id!))
            .then((_versions) => ({
              workUnits: _workUnits!,
              versions: _versions!,
            })),
        )
        .then((data) => {
          xmonitorService
            .getMonitorToken(data.workUnits!.map((wu) => wu.id!))
            .then((list) => {
              updateState((draft) => {
                draft.monitorList = list ?? [];
                draft.workUnits = data.workUnits!;
                draft.versions = data.versions!;
              });
            });
        }),
    { manual: true },
  );

  const reloadData = () => {
    updateState((draft) => {
      draft.workUnits = null;
      draft.versions = {};
    });
    run();
  };

  useEffect(() => {
    run();
  }, []);

  const release = (token: string | undefined) => {
    if (token) {
      Modal.confirm({
        title: "解除编辑状态提醒",
        content: (
          <p>
            解除编辑状态后，正在编辑该工作单元的设备将很可能出现丢失缓存、无法保存或提交的情况，请问是否继续？
          </p>
        ),
        okButtonProps: { danger: true, type: "default" },
        okText: "仍然继续",
        cancelText: "取消",
        async onOk() {
          await xmonitorService.releaseToken(token);
          reloadData();
        },
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (workUnits?.length === 0) {
    return (
      <div className="no-team">
        <EmptyWrapper
          isEmpty
          style={{ padding: 0 }}
          description={
            <>
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                您还未负责任何工作单元
              </div>
              <div style={{ color: "#aaa", fontSize: 14 }}>
                {!roles.includes(ProjectRole.ProjectAdmin) ? (
                  "请联系项目管理员为您创建并分配工作单元"
                ) : (
                  <>
                    请前往
                    <Link
                      to={`/projects/${projectId}/settings/collaboration/teams`}
                    >
                      协同设置
                    </Link>
                    创建并分配工作单元
                  </>
                )}
                ，解锁“个人设计”
              </div>
            </>
          }
        />
      </div>
    );
  }
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <DraftWorkUnitList
        workUnits={workUnits ?? []}
        versions={versions}
        setVersion={(dsId, versionId, desc) => {
          updateState((draft) => {
            const vv = draft.versions[dsId].find((v) => v.id === versionId);
            if (vv) {
              vv.description = desc;
            }
          });
        }}
        onReload={reloadData}
        extraActions={(record, version, isMaxVersion, modifyDescription) => {
          const xmon = monitorList.find((mon) => mon.dsId === record.id!);

          return (
            <Space size="middle">
              <VersionStatus
                version={version ?? null}
                workUnitType={record.type}
                project={project}
                mode="draft"
              />

              {isMaxVersion && xmon && (
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.PersonalDataset}
                >
                  <TooltipWrapper
                    when={(tooltipProps) => tooltipProps.disabled ?? false}
                    title="处于示例项目中无该功能权限"
                  >
                    <a
                      className="color-danger"
                      onClick={() => release(xmon?.token)}
                    >
                      解除编辑
                    </a>
                  </TooltipWrapper>
                </CheckPermission>
              )}

              {!(version?.version === 0) && (
                <Dropdown
                  overlay={
                    <div className="ant-dropdown-menu">
                      <div style={{ padding: "5px 12px" }}>
                        <CheckPermission
                          resouseType={
                            ResourcePermissionResourceEnum.PersonalDataset
                          }
                        >
                          <TooltipWrapper
                            when={(tooltipProps) =>
                              tooltipProps.disabled ?? false
                            }
                            title="处于示例项目中无该功能权限"
                          >
                            <a
                              className="text-normal"
                              onClick={modifyDescription}
                            >
                              编辑注释
                            </a>
                          </TooltipWrapper>
                        </CheckPermission>
                      </div>
                      {!isMaxVersion && (
                        <div style={{ padding: "5px 12px" }}>
                          {xmon ? (
                            <TooltipWrapper
                              disabled
                              when={() => true}
                              title="此工作单元正在被编辑，暂不支持版本恢复"
                            >
                              <Button type="link" disabled>
                                恢复
                              </Button>
                            </TooltipWrapper>
                          ) : (
                            /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
                            <RestoreButton
                              version={version ?? null}
                              workUnitId={record.id!}
                              onReload={reloadData}
                              onComplete={() => {
                                publishEvent(`restoreVersion`, ["个人设计"], {
                                  eventLevel: "P2",
                                });
                              }}
                            />
                          )}
                        </div>
                      )}

                      {!isMaxVersion && (
                        <div style={{ padding: "5px 12px" }}>
                          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
                          <DeleteButton
                            version={version ?? null}
                            workUnit={record}
                            onReload={reloadData}
                          />
                        </div>
                      )}
                    </div>
                  }
                  trigger={["click"]}
                >
                  <a
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    更多 <CaretDownOutlined />
                  </a>
                </Dropdown>
              )}
            </Space>
          );
        }}
      />
    </div>
  );
}

export function RestoreButton({
  version,
  workUnitId,
  onReload,
  onComplete,
}: {
  version: VersionVO | null;
  workUnitId: string | undefined;
  onReload: () => void;
  onComplete: () => void;
}) {
  function restore(dsId: string, thisVersion: number) {
    const confirmModal = Modal.confirm({
      content: (
        <>
          <p>确定恢复此版本为最新吗？</p>
          <p>
            （如在工具端有正处于打开状态的工作单元，数据将失效，请重新打开！）
          </p>
        </>
      ),
      okText: "确定",
      cancelText: "取消",
      width: 520,
      onOk() {
        confirmModal.update({ cancelButtonProps: { disabled: true } });
        return workUnitService
          .restoreVersion(dsId, thisVersion)
          .catch((err) => {
            if (err?.response?.data?.code === 40003) {
              message.error("此工作单元正在被编辑，暂不支持版本恢复。");
            } else {
              onResponseError(err);
            }
          })
          .finally(() => {
            onReload();
            onComplete();
          });
      },
    });
  }
  return (
    <CheckPermission
      resouseType={ResourcePermissionResourceEnum.PersonalDataset}
    >
      <TooltipWrapper
        when={(props) => props.disabled ?? false}
        title="处于示例项目中无该功能权限"
      >
        <Button
          type="link"
          className="text-normal"
          onClick={(e) => {
            if (workUnitId && version?.version) {
              restore(workUnitId, version.version);
            }
          }}
        >
          恢复
        </Button>
      </TooltipWrapper>
    </CheckPermission>
  );
}

function DeleteButton({
  version,
  workUnit,
  onReload,
  onComplete,
}: {
  version: VersionVO | null;
  workUnit: any;
  onReload: () => void;
  onComplete?: () => void;
}) {
  const deleteVersion = () => {
    if (version?.id) {
      const confirmModal = Modal.confirm({
        title: `您正在删除“${workUnit?.name}” 的 ${version?.displayVersion} 版本`,
        content: (
          <div className="color-disabled">
            该操作不可逆，删除后版本号将重新排列
          </div>
        ),
        okText: "删除",
        okButtonProps: { danger: true, type: "primary", ghost: true },
        cancelText: "取消",
        // width: 520,
        onOk() {
          confirmModal.update({ okButtonProps: { disabled: true } });
          return versionService
            .deleteVersion(workUnit.id!, version.id!)
            .then(() => {
              message.success("删除成功，版本号已自动重排");
              publishEvent(`deleteVersion`, ["个人设计"], {
                eventLevel: "P2",
              });
            })
            .catch(onResponseError)
            .finally(() => onReload());
        },
      });
    }
  };

  if (version?.status === "Published") {
    return (
      <TooltipWrapper disabled when={() => true} title="暂不支持删除提交版本">
        <Button type="link" disabled onClick={deleteVersion}>
          删除
        </Button>
      </TooltipWrapper>
    );
  }

  return (
    <CheckPermission
      resouseType={ResourcePermissionResourceEnum.PersonalDataset}
    >
      <TooltipWrapper
        when={(props) => props.disabled ?? false}
        title="处于示例项目中无该功能权限"
      >
        <Button type="link" onClick={deleteVersion} danger>
          删除
        </Button>
      </TooltipWrapper>
    </CheckPermission>
  );
}
