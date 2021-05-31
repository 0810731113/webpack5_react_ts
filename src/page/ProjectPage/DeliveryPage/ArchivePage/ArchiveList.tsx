import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import moment from "moment";

import { Empty, Button, Modal, Table, Divider } from "antd";
import { archiveService } from "service";
import Loading from "component/Loading";
import { ColumnType } from "antd/lib/table";
import { useRequest } from "@umijs/hooks";
import { ArchivePackageVO, ArchiveVersionVO } from "api/generated/model";

import ProjectUserName from "page/ProjectPage/_components/ProjectUserName";
import { defaultDateTimeFromString } from "function/date.func";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { publishEvent } from "function/stats.func";
import DeliverArchiveDrawer from "./DeliverArchiveDrawer";

interface PageData {
  archives: ArchivePackageVO[];
  versions: { [pkgId: string]: ArchiveVersionVO[] };
}

interface ArchiveListProps {
  onCountUnits?: (count: number) => void;
}

interface State {
  archives: ArchivePackageVO[];
  versions: { [pkgId: string]: ArchiveVersionVO[] };
  selectedArchiveId: string | null;
}

export default function ArchiveList(props: ArchiveListProps) {
  const { onCountUnits } = props;
  const [
    { archives, versions, selectedArchiveId },
    updateState,
  ] = useImmer<State>({
    archives: [],
    versions: {},
    selectedArchiveId: null,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = async () => {
    const _archives = await archiveService.getAllArchivesVersions(projectId);
    const _versions = await archiveService.batchLoadArchivesVersions(
      _archives.map((archive) => archive.id!),
    );

    updateState((draft) => {
      draft.archives = _archives;
      draft.versions = _versions;
    });
    onCountUnits?.(_archives.length);
    return null;
  };

  const { data, loading, run } = useRequest<PageData>(loader, {
    manual: true,
  });

  useEffect(() => {
    run();
  }, []);

  const getPkgFirstVersion = (pkgId: string | undefined) => {
    if (pkgId && versions[pkgId] && versions[pkgId].length > 0) {
      return versions[pkgId][0];
    }
    return null;
  };

  const deletePackage = (packageId: string) => {
    if (packageId) {
      Modal.confirm({
        title: "是否确定删除该交付包",
        okText: "删除",
        cancelText: "取消",
        okButtonProps: { danger: true, type: "primary", ghost: true },
        async onOk() {
          return archiveService.deleteArchive(packageId).then(() => {
            run();
            publishEvent(`deleteArchives`, ["项目交付", "交付包"], {
              eventLevel: "P2",
            });
          });
        },
      });
    }
  };

  const columns: ColumnType<ArchivePackageVO>[] = [
    {
      title: "项目交付包名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "组成",
      dataIndex: "components",
      key: "components",
      render(value, item) {
        const version = getPkgFirstVersion(item.id);
        return `${version?.content?.length}个交付单元`;
      },
    },

    {
      title: "创建者",
      dataIndex: "creator",
      width: "8%",
      render(value, item) {
        return <ProjectUserName id={item.userId!} />;
      },
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      width: "16%",
      render(value, item) {
        return defaultDateTimeFromString(item.updateTime);
      },
    },
    {
      title: "状态",
      dataIndex: "archiveStatus",
      width: "12%",
      render(value, item) {
        const version = getPkgFirstVersion(item.id);
        const status = version?.archiveStatus;
        if (status === 0) {
          return "草稿";
        }
        if (status === 1) {
          return "已完成";
        }
        return "-";
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      width: "16%",
      render(value, item) {
        const version = getPkgFirstVersion(item.id);
        const status = version?.archiveStatus;
        return (
          <>
            {version ? (
              version.archiveStatus === 1 ? (
                <Link
                  onClick={() => {
                    publishEvent(`viewArchives`, ["项目交付", "交付包"], {
                      eventLevel: "P2",
                    });
                  }}
                  to={`${url}/${item.id}/info`}
                >
                  查看
                </Link>
              ) : (
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.ArchivePackage}
                >
                  <Link to={`${url}/${item.id}/edit`}>修改</Link>
                </CheckPermission>
              )
            ) : (
              <span>error</span>
            )}

            <Divider type="vertical" />

            {status === 1 ? (
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ArchivePackage}
                writeCondition={(rights) =>
                  rights?.includes(
                    ResourcePermissionPermissionTypesEnum.SoftWrite,
                  ) ?? false
                }
              >
                <Button
                  type="link"
                  onClick={() => {
                    updateState((draft) => {
                      draft.selectedArchiveId = item.id!;
                    });
                    publishEvent(`deliveryArchives`, ["项目交付", "交付包"], {
                      eventLevel: "P1",
                    });
                  }}
                >
                  交付
                </Button>
              </CheckPermission>
            ) : (
              <span>交付</span>
            )}

            <Divider type="vertical" />

            {item.deletable ? (
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ArchivePackage}
              >
                <TooltipWrapper
                  when={(tooltipProps) => tooltipProps.disabled ?? false}
                  title="处于示例项目中无该功能权限"
                >
                  <Button
                    danger
                    type="link"
                    onClick={() => deletePackage(item.id!)}
                  >
                    删除
                  </Button>
                </TooltipWrapper>
              </CheckPermission>
            ) : (
              <TooltipWrapper
                disabled
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="已有交付记录的交付包不能删除"
              >
                <Button type="link">删除</Button>
              </TooltipWrapper>
            )}
          </>
        );
      },
    },
  ];

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="table-content" style={{ marginTop: 16 }}>
      <Table
        pagination={{ pageSize: 200, hideOnSinglePage: true }}
        columns={columns}
        dataSource={archives}
        // rowKey={'id'}
      />
      {selectedArchiveId && (
        <DeliverArchiveDrawer
          visible={!!selectedArchiveId}
          archiveId={selectedArchiveId!}
          onClose={() => {
            run();
            updateState((draft) => {
              draft.selectedArchiveId = null;
            });
          }}
        />
      )}
    </div>
  );
}
