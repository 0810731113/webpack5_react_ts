import React from "react";
import IssueList from "component/issue/IssueList";
import { useImmer } from "use-immer";
import { useRouteMatch, useLocation } from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import { Popover } from "antd";
import { QuestionCircleOutlined, MenuOutlined } from "@ant-design/icons";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import IssueDetail from "./IssueDetail";
import { BreadcrumbHeader } from "../CollaborationHeader";

interface IssuePageProps {}

const IssuePage = (props: IssuePageProps) => {
  const {
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const { pathname, search } = useLocation();
  const [{ refreshTag }, update] = useImmer({ refreshTag: Math.random() });
  const refreshIssueList = () => {
    update((draft) => {
      draft.refreshTag = Math.random();
    });
  };
  const { breadCrumbs } = useBreadCrumbs(
    "问题管理",
    "issueManage",
    `${pathname}${search}`,
    1,
  );
  return (
    <>
      <BreadcrumbHeader breadCrumbs={breadCrumbs} />
      <div className="issue-page">
        <IssueList
          className="sider"
          title={
            <div className="list-title">
              <div>
                <MenuOutlined />
                问题列表
              </div>

              <Popover
                placement="topRight"
                title={false}
                content={
                  <div className="issue-item-info" style={{ width: 194 }}>
                    请在模型显示界面中创建问题（例如工作单元查看或整合查看）
                  </div>
                }
              >
                <span className="issue-item-info">
                  <QuestionCircleOutlined style={{ marginRight: 4 }} />
                </span>
              </Popover>
            </div>
          }
          style={{
            flex: "none",
            width: 258,
            padding: 0,
            flexBasis: 258,
            overflow: "hidden",
            borderRight: "1px solid rgba(11,26,92,0.14)",
          }}
          refreshTag={refreshTag}
          teamId={teamId}
        />
        <IssueDetail refresh={refreshIssueList} />
      </div>
    </>
  );
};
export default IssuePage;
