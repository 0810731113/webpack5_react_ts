import React, { useEffect, useState, Fragment } from "react";
import { Breadcrumb, Row, message } from "antd";
import { Button, Descriptions, DescriptionsItem } from "component/Antd";
import { Link, useRouteMatch, useHistory } from "react-router-dom";
import { ProjectTeamPackageParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import { BooleanParam, useQueryParams, StringParam } from "use-query-params";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { useInformation } from "hook/use-share-service.hook";
import { ShareRecordEx, DataSetEx } from "service/package.service";
import { packageService, authService } from "service";
import { ShareRecordStatusEnum } from "api/generated/model";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { FromParam } from "page/ProjectPage/CollaborationPage/CollaborationPage";
import RcQueueAnim from "rc-queue-anim";
import Loading from "component/Loading";
import { defaultDateTimeFromString } from "function/date.func";
import Scrollbars from "react-custom-scrollbars";
import { defaultScrollbarSettings } from "consts";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { publishEvent } from "function/stats.func";
import { BreadcrumbHeader } from "../CollaborationHeader";
import ContentListViewer from "./ContentListViewer";
import ContentsList from "./ContentsList";
import BaseInfoForm from "./BaseInfoForm";

export const tips = {
  [ShareRecordStatusEnum.Temporary]: "草稿",
  [ShareRecordStatusEnum.Shared]: "已提交",
  [ShareRecordStatusEnum.Consumed]: "已收资",
};

interface PackageDetailPageProps {}
export interface PackageDetailPageState {
  info: ShareRecordEx;
  shareContent: DataSetEx[];
  name: string;
  description: string;
  isEdit: boolean;
}

export default function PackageDetailPage(props: PackageDetailPageProps) {
  const {
    url,
    params: { teamId, packageId },
  } = useRouteMatch<ProjectTeamPackageParams>();
  const history = useHistory();
  const [
    { info, shareContent, name, description, isEdit },
    updateState,
  ] = useImmer<PackageDetailPageState>({
    info: {},
    shareContent: [],
    name: "",
    description: "",
    isEdit: false,
  });
  const [{ isEditContents, from }, setQuery] = useQueryParams({
    isEditContents: BooleanParam,
    from: FromParam,
  });
  const { breadCrumbs } = useBreadCrumbs(
    `${name} ${info.id ? `(${(info.status && tips[info.status]) ?? ""})` : ""}`,
    "package",
    "",
    2,
  );
  const [{ teams, project }] = useRecoilState(projectPageState);
  const {
    info: originalInfo,
    shareContent: originalData,
    refresh: refreshSareInfo,
    loading,
  } = useInformation(packageId);
  const shareRecordIds = packageId.split(",");
  useEffect(() => {
    if (originalData) {
      updateState((draft) => {
        draft.shareContent = originalData;
      });
    }
  }, [originalData]);
  useEffect(() => {
    if (originalInfo) {
      updateState((draft) => {
        draft.info = originalInfo;
      });
    }
  }, [originalInfo]);
  useEffect(() => {
    updateState((draft) => {
      draft.name = info.name || "";
      draft.description = info.description || "";
    });
  }, [info]);
  const update = async () => {
    const addedVersions = shareContent
      .filter(
        (item) =>
          item.selectedVersion &&
          originalData.every(
            (oldItem) =>
              oldItem.selectedVersion?.id !== item.selectedVersion?.id,
          ),
      )
      .map((item) => item.selectedVersion?.id?.toString() || "")
      .filter(Boolean);
    const deletedVersions = originalData
      .filter(
        (oldItem) =>
          oldItem.selectedVersion &&
          shareContent.every(
            (item) => oldItem.selectedVersion?.id !== item.selectedVersion?.id,
          ),
      )
      .map((oldItem) => oldItem.selectedVersion?.id?.toString() || "")
      .filter(Boolean);
    return packageService.updatePackage({
      name,
      description,
      addedVersions,
      deletedVersions,
      shareRecordIds,
    });
  };
  const saveBaseInfo = async () => {
    await update();
    updateState((draft) => {
      draft.info = { ...info, name, description };
      draft.isEdit = false;
    });
  };

  const addContent = async (item: DataSetEx) => {
    // const versions = await dataSetApi.getDataSetVersionsUsingGET(item?.id || ''));;
    // versions.sort((a, b) => b.version - a.version);
    updateState((draft) => {
      draft.shareContent = [
        ...shareContent,
        {
          ...item,
        },
      ];
    });
  };

  const share = async () => {
    if (!shareContent || shareContent.length === 0) {
      message.error("请选择要共享的工作单元");
      return;
    }
    await update();
    await packageService.sharePackage(shareRecordIds, authService.getUserId()!);
    refreshSareInfo();
    if (isEditContents) {
      setQuery({ isEditContents: false });
    } else {
      // props.history.replace(`${gotoUrl}/${from}`);
    }
  };
  const doAccept = async () => {
    const promiseList = shareRecordIds.map(async (sId) =>
      packageService.acceptPackage(sId, authService.getUserId()!),
    );
    await Promise.all(promiseList);
    publishEvent(`receivedPackages`, ["团队协同", "提收资"], {
      eventLevel: "P1",
    });
    history.push(breadCrumbs[0]?.url);
  };
  const save = async () => {
    await update();
    setQuery({ isEditContents: false });
  };

  if (loading) {
    return <Loading absolute size={64} />;
  }
  return (
    <div className="package-detail-page">
      <Scrollbars {...defaultScrollbarSettings}>
        <div className="detail-content">
          <RcQueueAnim>
            {isEditContents && (
              <ContentListViewer
                key="workUnitList"
                teamId={teamId}
                contents={shareContent}
                addContent={addContent}
              />
            )}
          </RcQueueAnim>
          <div className="detail-info">
            <RcQueueAnim>
              <BaseInfoForm
                key="baseInfoForm"
                isEdit={isEdit}
                canEdit={!isEditContents}
                info={{ name, description }}
                onEdit={
                  info.status === ShareRecordStatusEnum.Temporary
                    ? () =>
                        updateState((draft) => {
                          draft.isEdit = true;
                        })
                    : undefined
                }
                onChangeInfo={(newInfo) => {
                  updateState((draft) => {
                    draft.name = newInfo.name;
                    draft.description = newInfo.description;
                  });
                }}
              />
              {isEdit && (
                <div
                  key="baseInfoFormNav"
                  className="content-nav"
                  style={{ justifyContent: "flex-end" }}
                >
                  <Button
                    onClick={() => {
                      updateState((draft) => {
                        draft.isEdit = false;
                        draft.info = { ...info };
                      });
                    }}
                  >
                    取消
                  </Button>
                  <CheckPermission
                    resouseType={ResourcePermissionResourceEnum.SharePackage}
                  >
                    <TooltipWrapper
                      when={(tooltipProps) => tooltipProps.disabled ?? false}
                      title="处于示例项目中无该功能权限"
                    >
                      <Button type="primary" onClick={saveBaseInfo}>
                        保存
                      </Button>
                    </TooltipWrapper>
                  </CheckPermission>
                </div>
              )}
              {info.id &&
                info.status !== ShareRecordStatusEnum.Temporary &&
                !isEditContents &&
                !isEdit && (
                  <Descriptions key="shareInfo">
                    <DescriptionsItem label="提资者">
                      {info.shareUserName}
                    </DescriptionsItem>
                    {info.consumedId === teamId ? (
                      <DescriptionsItem label="提资团队">
                        {
                          (
                            (teams &&
                              teams.find((team) => team.id === info.shareId)) ||
                            {}
                          ).name
                        }
                      </DescriptionsItem>
                    ) : (
                      <DescriptionsItem label="提资状态">
                        <span
                          className={
                            info.status === ShareRecordStatusEnum.Consumed
                              ? "done-label"
                              : "not-done-label"
                          }
                        >
                          {info.status === ShareRecordStatusEnum.Consumed
                            ? "已"
                            : "未"}
                          接收
                        </span>
                      </DescriptionsItem>
                    )}
                    <DescriptionsItem label="提资日期">
                      {info &&
                        info.shareTime &&
                        defaultDateTimeFromString(info.shareTime)}
                    </DescriptionsItem>
                  </Descriptions>
                )}
              {info && info.consumedId === teamId && (
                <Descriptions key="consumeInfo">
                  <DescriptionsItem label="收资者">
                    {info.consumeUserName}
                  </DescriptionsItem>
                  <DescriptionsItem label="收资团队">
                    {
                      (
                        (teams &&
                          teams.find((team) => team.id === info.consumedId)) ||
                        {}
                      ).name
                    }
                  </DescriptionsItem>
                  <DescriptionsItem label="收资日期">
                    {info && info.acceptTime && info.acceptTime.substr(0, 10)}
                  </DescriptionsItem>
                </Descriptions>
              )}
              <ContentsList
                key="contentsList"
                onChangeVersion={(item, val) => {
                  updateState((draft) => {
                    draft.shareContent = shareContent.map((unit) => ({
                      ...unit,
                      selectedVersion:
                        unit.id === item.id
                          ? item.versions?.find((ver) => ver.id === val) || {}
                          : unit.selectedVersion,
                    }));
                  });
                }}
                shareContent={shareContent}
                editable={!!isEditContents}
                onRemoveContent={(removeItem) =>
                  updateState((draft) => {
                    draft.shareContent = shareContent.filter(
                      (item) => item.id !== removeItem.id,
                    );
                  })
                }
              />
              <div className="content-nav" key="contentsListNav">
                <Button disabled={isEdit}>
                  <Link
                    to={`/model-viewer?versionIdList=${shareContent?.map(
                      (content) => content?.selectedVersion?.id,
                    )}&format=${shareContent[0]?.type}&title=“${
                      project?.name
                    }”模型查看`}
                    target="_blank"
                  >
                    整体预览
                  </Link>
                </Button>
                <span>
                  {info.consumedId === teamId &&
                    info.status !== ShareRecordStatusEnum.Consumed && (
                      <CheckPermission
                        resouseType={
                          ResourcePermissionResourceEnum.AcceptPackage
                        }
                      >
                        <TooltipWrapper
                          when={(tooltipProps) =>
                            tooltipProps.disabled ?? false
                          }
                          title="处于示例项目中无该功能权限"
                        >
                          <Button type="primary" onClick={doAccept}>
                            接收
                          </Button>
                        </TooltipWrapper>
                      </CheckPermission>
                    )}
                  {info.status === ShareRecordStatusEnum.Temporary && (
                    <>
                      <CheckPermission
                        resouseType={
                          ResourcePermissionResourceEnum.SharePackage
                        }
                      >
                        <TooltipWrapper
                          when={(tooltipProps) =>
                            tooltipProps.disabled ?? false
                          }
                          title="处于示例项目中无该功能权限"
                        >
                          {isEditContents ? (
                            <Button onClick={save}>存草稿</Button>
                          ) : (
                            <Button
                              disabled={isEdit}
                              onClick={() => setQuery({ isEditContents: true })}
                            >
                              编辑
                            </Button>
                          )}
                        </TooltipWrapper>
                      </CheckPermission>

                      <CheckPermission
                        resouseType={
                          ResourcePermissionResourceEnum.SharePackage
                        }
                      >
                        <TooltipWrapper
                          when={(tooltipProps) =>
                            tooltipProps.disabled ?? false
                          }
                          title="处于示例项目中无该功能权限"
                        >
                          <Button
                            disabled={isEdit}
                            type="primary"
                            onClick={share}
                          >
                            提资
                          </Button>
                        </TooltipWrapper>
                      </CheckPermission>
                    </>
                  )}
                </span>
              </div>
            </RcQueueAnim>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
}
