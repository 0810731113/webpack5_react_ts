import React, { useState, useEffect } from "react";
import {
  Dropdown,
  Menu,
  Avatar,
  Divider,
  Space,
  Tooltip,
  Breadcrumb,
} from "antd";
import { Link, useRouteMatch, useLocation, useHistory } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import projectPageState, { teamByIdSelector } from "state/project.state";
import { useQueryParams, StringParam, useQueryParam } from "use-query-params";
import { ProjectTeamParams } from "model/route-params.model";
import TweenOne from "rc-tween-one";
import {
  DownOutlined,
  CrownOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import consts from "consts";
import "rc-texty/assets/index.css";
import { useIssueList } from "hook/use-issue-service.hook";
import { useSharePackages, useShareRecords } from "hook/use-share-service.hook";
import { ShareRecordVOStatusEnum } from "api/generated/model";
import { BreadCrumbItem } from "state/app.state";
import { useImmer } from "use-immer";
import { StatusEnum } from "component/issue/IssueList";
import { publishEvent } from "function/stats.func";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { CheckPermissionComponent } from "component/CheckPermission/CheckPermissionComponent";

const { PUBLIC_URL, ENV } = consts;

const ChildrenPlugin = require("rc-tween-one/lib/plugin/ChildrenPlugin");

TweenOne.plugins.push(ChildrenPlugin);

interface CollaborationHeaderProps {}

interface Animation {
  value: number;
  floatLength: number;
}
interface CollaborationHeaderState {
  shareDataCountAnimation?: {
    Children: Animation;
    duration: number;
  };
  acceptDataCountAnimation?: {
    Children: Animation;
    duration: number;
  };
  issuesCountAnimation?: {
    Children: Animation;
    duration: number;
  };
}

export default function CollaborationHeader(props: CollaborationHeaderProps) {
  const [{ type }] = useQueryParams({
    type: StringParam,
  });
  const {
    url,
    params: { teamId, projectId },
  } = useRouteMatch<ProjectTeamParams>();
  const [
    { shareDataCountAnimation, acceptDataCountAnimation, issuesCountAnimation },
    updateState,
  ] = useImmer<CollaborationHeaderState>({});
  const [{ myTeams, users }] = useRecoilState(projectPageState);
  const history = useHistory();
  const team = useRecoilValue(teamByIdSelector(teamId));
  const { pathname, search } = useLocation();
  const [mouseOverCreate, setMouseOverCreate] = useState<boolean>(false);
  const titleKey = type ? `${type}Packages` : pathname.split("/").pop();

  // useEffect(() => {
  //   if (myTeams?.findIndex((team) => team.id === teamId) === -1) {
  //     history.replace(
  //       `${pathname.replace(teamId, myTeams[0]?.id ?? "none")}${search}`,
  //     );
  //   }
  // }, [teamId, myTeams]);
  const { issues, loading: loadingIssues } = useIssueList({ teamId });
  // const issues = useIssues({ teamId }).sort((a, b) =>
  //   (b.updateTime || b.creationTime) > (a.updateTime || a.creationTime) ? 1 : -1
  // );
  const [shareData] = useSharePackages({ teamId });
  const [showPackageModal, setShowPackageModal] = useQueryParam(
    "showPackageModal",
    StringParam,
  );
  const {
    records: acceptData,
    loading: loadingShareRecords,
  } = useShareRecords({ consumeId: teamId });
  console.log(acceptData);
  useEffect(() => {
    if (shareData) {
      updateState((draft) => {
        draft.shareDataCountAnimation = {
          Children: { value: shareData?.length, floatLength: 0 },
          duration: 1000,
        };
      });
    }
  }, [shareData?.length]);
  useEffect(() => {
    if (acceptData) {
      updateState((draft) => {
        draft.acceptDataCountAnimation = {
          Children: {
            value: acceptData?.reduce(
              (count, data) =>
                data.status === ShareRecordVOStatusEnum.Shared
                  ? count + 1
                  : count,
              0,
            ),
            floatLength: 0,
          },
          duration: 1000,
        };
      });
    }
  }, [acceptData?.length]);
  useEffect(() => {
    if (issues) {
      updateState((draft) => {
        draft.issuesCountAnimation = {
          Children: {
            value: issues?.reduce(
              (count, data) =>
                data.status !== StatusEnum.Solve &&
                data.status !== StatusEnum.Close
                  ? count + 1
                  : count,
              0,
            ),
            floatLength: 0,
          },
          duration: 1000,
        };
      });
    }
  }, [issues?.length]);
  const menu = (
    <Menu>
      {myTeams?.map((myTeam) => (
        <Menu.Item key={myTeam.id}>
          <Link to={`${pathname.replace(teamId, myTeam.id ?? "")}${search}`}>
            {myTeam.name}
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <header className="header">
      <Avatar
        style={{
          fontSize: 32,
          backgroundSize: "cover",
          backgroundImage: `url(${PUBLIC_URL}/assets/images/cover2.jpg)`,
        }}
        size={68}
      >
        {team?.name?.substr(0, 1)}
      </Avatar>
      <Space
        className="team-select-wrap"
        direction="vertical"
        align="start"
        size={4}
      >
        <div className="team-name">
          {team?.name}
          <Divider type="vertical" style={{ height: 16 }} />
          <Dropdown
            overlay={menu}
            placement="bottomCenter"
            disabled={
              myTeams?.findIndex((myTeam) => myTeam.id === teamId) === -1
            }
          >
            <a className="team-select" onClick={(e) => e.preventDefault()}>
              切换
              <DownOutlined />
            </a>
          </Dropdown>
        </div>
        {/* <Space className="master">
          <CrownOutlined />
          负责人:
          {users?.find((user) => user.id === team?.ownerId)?.name}
        </Space> */}
        <p className="description">{team?.description}</p>
      </Space>
      <div className="counts">
        <Link
          onClick={() => {
            // publishEvent(`团队协同`, {
            //   后向去处: "提资记录",
            // });
          }}
          to={`${url.split("/overview")[0]}/packages?type=shared`}
          className={["count-info", mouseOverCreate ? "not-hover" : ""].join(
            " ",
          )}
        >
          <span className="count">
            <TweenOne animation={shareDataCountAnimation} component="span">
              0
            </TweenOne>
          </span>
          <span className="count-title">
            提资记录
            <CheckPermissionComponent
              resouseType={ResourcePermissionResourceEnum.SharePackage}
              writeableHtml={
                <Tooltip trigger="hover" title="创建资料包" placement="bottom">
                  <PlusSquareOutlined
                    className="create-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setShowPackageModal("overview");
                    }}
                    onMouseEnter={() => setMouseOverCreate(true)}
                    onMouseLeave={() => setMouseOverCreate(false)}
                  />
                </Tooltip>
              }
              readonlyHtml={
                <Tooltip
                  trigger="hover"
                  title="处于示例项目中无此权限"
                  placement="bottom"
                >
                  <PlusSquareOutlined
                    className="create-button"
                    style={{
                      color: "rgba(0, 0, 0, 0.25)",
                      cursor: "not-allowed",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                    }}
                    onMouseEnter={() => setMouseOverCreate(true)}
                    onMouseLeave={() => setMouseOverCreate(false)}
                  />
                </Tooltip>
              }
            />
          </span>
        </Link>
        <Divider
          type="vertical"
          style={{ height: 77, margin: "0 30px" }}
          dashed
        />
        <Link
          to={`${url.split("/overview")[0]}/packages?type=received`}
          className="count-info"
          onClick={() => {
            // publishEvent(`团队协同`, {
            //   后向去处: "收资记录",
            // });
          }}
        >
          <span className="count">
            <TweenOne animation={acceptDataCountAnimation} component="span">
              0
            </TweenOne>
            {acceptData?.length ? (
              <span className="count-total">/{acceptData?.length}</span>
            ) : null}
          </span>
          <span className="count-title">收资记录</span>
        </Link>
        <Divider
          type="vertical"
          style={{ height: 77, margin: "0 30px" }}
          dashed
        />
        <Link
          to={`${url.split("/overview")[0]}/issues`}
          className="count-info"
          onClick={() => {
            // publishEvent(`团队协同`, {
            //   后向去处: "问题管理",
            // });
          }}
        >
          <span className="count">
            <TweenOne animation={issuesCountAnimation} component="span">
              0
            </TweenOne>
            {issues?.length ? (
              <span className="count-total">/{issues?.length}</span>
            ) : null}
          </span>
          <span className="count-title">问题管理</span>
        </Link>
      </div>
      {/* <span>{titles[titleKey ?? "overview"]}</span> */}
    </header>
  );
}

interface BreadcrumbHeaderProps {
  breadCrumbs: BreadCrumbItem[];
}
export function BreadcrumbHeader(props: BreadcrumbHeaderProps) {
  const { breadCrumbs } = props;
  return (
    <header className="detail-header">
      <Breadcrumb>
        {breadCrumbs.map((breadCrumb) => (
          <Breadcrumb.Item key={breadCrumb.title}>
            {breadCrumb.url ? (
              <Link to={`${breadCrumb.url}`}>{breadCrumb.title}</Link>
            ) : (
              breadCrumb.title
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </header>
  );
}
