import { Button } from "component/Antd";
import EmptyWrapper from "component/EmptyWrapper";
import React, { FC } from "react";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { useQueryParam } from "use-query-params";
import { ViewTypeParam, ViewType } from "./WorkspacePage";

interface ProjectEmptyWrapperProps {
  isEmpty: boolean;
  creatButton?: false | JSX.Element;
}

const ProjectEmptyWrapper: FC<ProjectEmptyWrapperProps> = ({
  isEmpty,
  creatButton,
  children,
}) => {
  const [viewType, setViewType] = useQueryParam("viewType", ViewTypeParam);
  const [{ currentUser }] = useRecoilState(projectPageState);
  return (
    <EmptyWrapper
      isEmpty={isEmpty}
      description={
        <>
          <div>
            {currentUser?.isMainAccount || currentUser?.isPersonalAccount
              ? `暂无${
                  viewType === ViewType.Personal &&
                  !currentUser?.isPersonalAccount
                    ? "参与"
                    : ""
                }项目`
              : "普通账号暂无权限创建项目"}
          </div>
          {viewType === ViewType.Manage || currentUser?.isPersonalAccount ? (
            creatButton
          ) : currentUser?.isMainAccount ? (
            <Button onClick={() => setViewType(ViewType.Manage)}>
              前往企业工作台参与项目
            </Button>
          ) : (
            <div style={{ fontSize: 12 }}>请耐心等待企业账号用户创建项目</div>
          )}
        </>
      }
    >
      {children}
    </EmptyWrapper>
  );
};
export default ProjectEmptyWrapper;
