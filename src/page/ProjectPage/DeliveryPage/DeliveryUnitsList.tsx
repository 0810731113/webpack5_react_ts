import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button } from "component/Antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Table, Modal, Popover, Input, Divider, Tag } from "antd";
import { ColumnType } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import { defaultDateTimeFromString } from "function/date.func";

import ProjectUserName from "page/ProjectPage/_components/ProjectUserName";
import { size } from "lodash";
import VersionInfoList from "component/Version/VersionInfoList";
import { useRequest } from "@umijs/hooks";
import { integratePackagesService, bfproxyService } from "service";
import {
  IntegratePackageVO,
  IntegrateVersionVO,
  IntegrateVersionVOIntegrateStatusEnum,
} from "api/generated/model";
import Loading from "component/Loading";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { publishEvent } from "function/stats.func";

type RowData = IntegratePackageVO & {
  key: number;
};

interface DeliveryUnitsListProps {
  onCheckUnits?: (arr: number[]) => void;
  showSelectedOnly?: boolean;
  onCountUnits?: (count: number) => void;
  selectedUnitIds?: number[];
  showDelete?: boolean;
}

interface State {
  integrates: IntegratePackageVO[];
  versions: { [pkgId: string]: IntegrateVersionVO[] };
  apiLoading: boolean;
}

export default function DeliveryUnitsList(props: DeliveryUnitsListProps) {
  const {
    onCheckUnits,
    selectedUnitIds,
    showSelectedOnly,
    onCountUnits,
    showDelete = true,
  } = props;
  const [{ integrates, versions }, updateState] = useImmer<State>({
    integrates: [],
    versions: {},
    apiLoading: false,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [{ project }] = useRecoilState(projectPageState);
  const loader = async () => {
    const newIntegrates = await integratePackagesService.getAllIntegratesVersions(
      projectId,
    );
    let newVersions = {};
    if (newIntegrates instanceof Array && newIntegrates.length > 0) {
      newVersions = await integratePackagesService.batchLoadIntegratesVersions(
        newIntegrates.map((integrate) => integrate.id!),
      );
    }

    updateState((draft) => {
      draft.integrates = newIntegrates;
      draft.versions = newVersions;
    });

    onCountUnits?.(newIntegrates.length);

    return null;
  };
  const { loading, data, run } = useRequest(loader);

  const getPkgFirstVersion = (pkgId: string | undefined) => {
    if (pkgId && versions[pkgId] && versions[pkgId].length > 0) {
      return versions[pkgId][0];
    }
    return null;
  };

  const getPkgFirstVersionId = (pkgId: string) => {
    const version = getPkgFirstVersion(pkgId);
    if (version) {
      return version.id;
    }
    return null;
  };

  function startDownload(fileId: string) {
    if (fileId) {
      bfproxyService.getFileDownloadUrl(fileId).then((res) => {
        window.open(res.data, "_blank");
      });
    }
  }

  function deletePackage(intId: string) {
    if (intId) {
      Modal.confirm({
        title: "是否确定删除该交付单元",
        okText: "删除",
        cancelText: "取消",
        okButtonProps: { danger: true, type: "primary", ghost: true },
        async onOk() {
          return integratePackagesService.deleteIntegrate(intId).then(() => {
            run();
            publishEvent(`deleteResources`, ["项目交付", "资源池"], {
              eventLevel: "P1",
            });
          });
        },
      });
    }
  }

  const columns: ColumnType<RowData>[] = [
    {
      title: "交付单元名称",
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: "版本",
    //   dataIndex: "versions",
    //   key: "versions",
    //   className: "versions",
    //   width: "8%",
    //   render(value, item) {
    //     return "V1";
    //   },
    // },

    {
      title: "组成",
      dataIndex: "xx",
      width: "20%",
      render(value, item) {
        let versionIds: number[] = [];

        const version = getPkgFirstVersion(item.id);
        if (
          version &&
          version.datasetVersions &&
          version.datasetVersions.length > 0
        ) {
          versionIds = version.datasetVersions;
        }

        if (size(versionIds) === 0) {
          return <span>无工作单元</span>;
        }

        const content = <VersionInfoList versionIds={versionIds} />;
        return (
          <Popover content={content} placement="bottom">
            <Input
              size="small"
              readOnly
              value={`${versionIds.length}个工作单元`}
              style={{ width: 100 }}
            />
          </Popover>
        );
      },
    },
    {
      title: "创建者",
      dataIndex: "creator",
      width: "10%",
      render(value, item) {
        return <ProjectUserName id={item.userId!} />;
      },
    },
    {
      title: "更新时间",
      dataIndex: "datetime",
      width: "20%",
      render(value, item) {
        return defaultDateTimeFromString(item.updateTime);
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "15%",
      render(value, item) {
        const version = getPkgFirstVersion(item.id);
        if (version && version.integrateStatus) {
          switch (version.integrateStatus) {
            case IntegrateVersionVOIntegrateStatusEnum.SUCCESS:
              return <span>转换成功</span>;
            // return <Tag color="success">转换成功</Tag>;
            case IntegrateVersionVOIntegrateStatusEnum.PROCESSING:
              return <span className="color-disabled">正在转换</span>;
            // return <Tag color="processing">正在转换</Tag>;
            case IntegrateVersionVOIntegrateStatusEnum.READY:
              return <span className="color-disabled">正在转换</span>;
            // return <Tag color="processing">正在转换</Tag>;
            case IntegrateVersionVOIntegrateStatusEnum.FAILED:
              return <span className="color-danger">转换失败</span>;
            // return <Tag color="error">转换失败</Tag>;
            default:
              return <Tag>无数据</Tag>;
          }
        }
        return <Tag>无数据</Tag>;
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      width: "20%",
      render(value, item) {
        const version = getPkgFirstVersion(item.id);
        let fileId = "";
        let versionIds: number[] = [];
        if (version && version.fileId) {
          fileId = version.fileId;
        }

        const isSuccess =
          version?.integrateStatus ===
          IntegrateVersionVOIntegrateStatusEnum.SUCCESS;
        if (version && version.datasetVersions instanceof Array) {
          versionIds = version.datasetVersions;
        }

        return (
          <>
            {isSuccess && size(versionIds) > 0 ? (
              <Link
                onClick={() => {
                  publishEvent(`viewResources`, ["项目交付", "资源池"], {
                    eventLevel: "P2",
                  });
                }}
                to={`/model-viewer?versionIdList=${versionIds.join(
                  ",",
                )}&format=gap&fileId=${fileId}&title=“${
                  project?.name
                }”模型查看`}
                target="_blank"
              >
                <Button type="link">查看</Button>
              </Link>
            ) : (
              <TooltipWrapper disabled when={() => true} title="不能查看">
                <Button type="link">查看</Button>
              </TooltipWrapper>
            )}

            <Divider type="vertical" />

            {isSuccess ? (
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ArchivePackage}
              >
                <TooltipWrapper
                  when={({ disabled }) => disabled ?? false}
                  title="处于示例项目中无该功能权限"
                >
                  <Button
                    type="link"
                    onClick={(e) => {
                      startDownload(fileId);
                      publishEvent(
                        `downloadResources`,
                        ["项目交付", "资源池"],
                        {
                          eventLevel: "P1",
                        },
                      );
                    }}
                  >
                    下载
                  </Button>
                </TooltipWrapper>
              </CheckPermission>
            ) : (
              <TooltipWrapper disabled when={() => true} title="不能下载">
                <Button type="link">下载</Button>
              </TooltipWrapper>
            )}

            {showDelete && (
              <>
                <Divider type="vertical" />
                {item.deletable ? (
                  <CheckPermission
                    resouseType={ResourcePermissionResourceEnum.ArchivePackage}
                  >
                    <TooltipWrapper
                      when={({ disabled }) => disabled ?? false}
                      title="处于示例项目中无该功能权限"
                    >
                      <Button
                        type="link"
                        danger
                        onClick={() => deletePackage(item.id!)}
                      >
                        删除
                      </Button>
                    </TooltipWrapper>
                  </CheckPermission>
                ) : (
                  <TooltipWrapper disabled when={() => true} title="不能删除">
                    <Button type="link">删除</Button>
                  </TooltipWrapper>
                )}
              </>
            )}
          </>
        );
      },
    },
  ];

  const isLineDisabled = (record: RowData) => {
    const version = getPkgFirstVersion(record.id!);
    let isSuccess = false;
    if (version) {
      isSuccess =
        version?.integrateStatus ===
        IntegrateVersionVOIntegrateStatusEnum.SUCCESS;
    }
    return !isSuccess;
  };

  const rowSelection: TableRowSelection<RowData> | undefined = onCheckUnits
    ? {
        type: "checkbox",
        selectedRowKeys: selectedUnitIds,
        getCheckboxProps(record) {
          return {
            disabled: isLineDisabled(record),
          };
        },
        onChange(selectedRowKeys, selectedRows) {
          // if (selectedRows.some((row) => row.type !== selectedRows[0].type)) {
          //   notification.warn({
          //     message: "只能整合查看同一类型的工作单元",
          //   });
          //   return;
          // }

          onCheckUnits?.(selectedRowKeys as number[]);
        },
      }
    : undefined;

  const formedData = integrates.map((int) => ({
    ...int,
    key: getPkgFirstVersionId(int.id!) ?? -1,
  }));

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="table-content" style={{ marginTop: 16 }}>
      <Table
        rowSelection={rowSelection}
        pagination={{ pageSize: 200, hideOnSinglePage: true }}
        columns={columns}
        dataSource={
          showSelectedOnly
            ? formedData.filter((item) => selectedUnitIds?.includes(item.key))
            : formedData
        }
      />
    </div>
  );
}
