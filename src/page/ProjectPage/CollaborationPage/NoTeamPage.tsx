import React, { useEffect } from "react";
import consts from "consts";
import { Typography, Space, Button } from "antd";
import { Link, useRouteMatch, useHistory } from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import EmptyWrapper from "component/EmptyWrapper";
import { ProjectRole } from "service/role.service";

const { PUBLIC_URL } = consts;

const { Title, Text } = Typography;

interface NoTeamPageProps {}
const NoTeamPage: React.FC<NoTeamPageProps> = (props) => {
  const {
    params: { projectId, teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const [{ myTeams, roles }] = useRecoilState(projectPageState);
  const history = useHistory();
  useEffect(() => {
    if (myTeams?.length) {
      history.replace(
        `/projects/${projectId}/collaboration/teams/${myTeams[0].id}/overview/workunits`,
      );
    }
  }, [myTeams]);
  return (
    <div className="collaboration-page no-team">
      {/* <img src={`${PUBLIC_URL}/assets/images/team.png`} alt="team" />
      <Space direction="vertical" style={{ padding: "0 30px" }}>
        <Title>团队协同</Title>
        <Text></Text>通过“团队协同”，您可以：
        <Text>1. 查看与管理团队的设计工作</Text>
        <Text>2. 查看与管理团队的工作单元</Text>
        <Text>3. 查看与管理团队的提资记录</Text>
        <Text>4. 查看与管理团队的收资记录</Text>
        <Text>5. 查看与管理团队的问题记录</Text>
        <Text>6. 查看与管理团队所需的文档资料</Text>
        <Button type="primary" className="goto-setting" size="large">
          <Link to={`/projects/${projectId}/settings/collaboration/teams`}>
            前往新建团队
          </Link>
        </Button>
      </Space> */}
      <EmptyWrapper
        isEmpty
        style={{ padding: 0 }}
        description={
          <>
            <div style={{ fontWeight: "bold", fontSize: 16 }}>
              您还未加入任何团队
            </div>
            <div style={{ color: "#aaa", fontSize: 14 }}>
              {!roles.includes(ProjectRole.ProjectAdmin) ? (
                "请联系项目管理员加入团队"
              ) : (
                <>
                  请前往
                  <Link
                    to={`/projects/${projectId}/settings/collaboration/teams`}
                  >
                    协同设置
                  </Link>
                  加入或创建团队
                </>
              )}
              ，解锁“团队协同”
            </div>
          </>
        }
       />
    </div>
  );
};
export default NoTeamPage;
