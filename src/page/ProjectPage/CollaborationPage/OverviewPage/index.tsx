import React from "react";
import { Col, Modal, message, Tag, Form, Tabs, Tooltip } from "antd";
import {
  Select,
  Button,
  List,
  ListItem,
  SelectOption,
  Row,
} from "component/Antd";
import { StringParam, useQueryParam } from "use-query-params";
import { useShareRecords, useSharePackages } from "hook/use-share-service.hook";
import { useIssueList } from "hook/use-issue-service.hook";
import useTeamUsers from "hook/use-team-users.hook";
import { usePermissions } from "hook/use-permission.hook";
import {
  Link,
  useHistory,
  useRouteMatch,
  Switch,
  Route,
} from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import {
  MinusCircleOutlined,
  ArrowRightOutlined,
  UsergroupAddOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useImmer } from "use-immer";
import { useRecoilState, useRecoilValue } from "recoil";
import projectPageState, { teamByIdSelector } from "state/project.state";
import { ShareRecordVO, Version, DataSet } from "api/generated/model";
import { timeago } from "function/date.func";
import { permissionService } from "service";
import {
  useWorkUnitListByTeamId,
  useVersionListByWorkUnits,
} from "hook/use-work-unit-service.hook";
import { version } from "punycode";
import { transIssueTypeMap } from "component/issue/IssueList";
import { publishEvent } from "function/stats.func";
import consts from "consts";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import CollaborationHeader from "../CollaborationHeader";
import WorkUnitPage from "../WorkUnitPage";
import FilesPage from "../FilesPage/FilesPage";
import OverviewCard from "./OverviewCard";
import "./Overview.scss";

const { ENV } = consts;

const { TabPane } = Tabs;
interface OverviewProps {}
interface OverviewState {
  addPermissionVisible: boolean;
  activeTab: string;
}
const Overview: React.FC<OverviewProps> = (props) => {
  const { replace } = useHistory();
  const {
    url,
    path,
    params: { teamId, projectId },
  } = useRouteMatch<ProjectTeamParams>();
  const [form] = Form.useForm();
  const [{ addPermissionVisible, activeTab }, update] = useImmer<OverviewState>(
    {
      addPermissionVisible: false,
      activeTab: "workunits",
    },
  );
  const { users, loading: loadingUsers } = useTeamUsers(teamId);
  const [{ teams }] = useRecoilState(projectPageState);
  const team = useRecoilValue(teamByIdSelector(teamId));
  const {
    permissions,
    refresh: refreshPermissions,
    loading: loadingPermissions,
  } = usePermissions(teamId, "Trust");
  const closePermissionModal = () =>
    update((draft) => {
      draft.addPermissionVisible = false;
    });
  const onTrustTeams = () => {
    const selectAddPermissionTeamId = form.getFieldValue(
      "selectAddPermissionTeamId",
    );
    if (!selectAddPermissionTeamId) {
      message.error("请选择要授信的团队");
      return;
    }
    closePermissionModal();
    Modal.confirm({
      title: "确认添加",
      content:
        "把该团队添加至实时协同团队后，该团队将查看、使用本团队所有已提交的数据，确认继续？",
      cancelButtonProps: { type: "primary", ghost: true },
      async onOk() {
        const result = await permissionService.createTrustTeam(
          teamId,
          selectAddPermissionTeamId!,
        );
        if (result) {
          refreshPermissions();
          publishEvent(`addRealTimeTeam`, ["团队协同", "实时协同"], {
            eventLevel: "P1",
          });
        }
      },
    });
  };
  const onDeleteTrustTeams = (trustTeamId: string) => {
    Modal.confirm({
      title: "移除实时协同团队",
      content: (
        <p style={{ color: "#000", fontSize: 14 }}>
          移除团队二的实时协同权限将影响其正在使用的“放权”工作单元。
        </p>
      ),
      okButtonProps: { danger: true, type: "default" },
      okText: "移除",
      cancelButtonProps: { type: "primary", ghost: true },
      async onOk() {
        await permissionService.deleteTrustTeam(teamId, trustTeamId);
        refreshPermissions();
      },
    });
  };
  return (
    <div className="content overviw-page">
      <CollaborationHeader />
      <Row
        gutter={0}
        style={{
          flexFlow: "column wrap",
          alignContent: "space-between",
          height: "calc(100% - 140px)",
          justifyContent: "space-between",
        }}
      >
        <Col
          key="workUnit"
          style={{
            flex: "auto",
            height: "100%",
            width: "calc(100% - 260px)",
            margin: 0,
          }}
        >
          <OverviewCard>
            <Tabs
              defaultActiveKey="workunits"
              activeKey={activeTab}
              onChange={(activeKey) => replace(`${url}/${activeKey}`)}
            >
              <TabPane tab="工作单元" key="workunits" />
              <TabPane tab="其他文档" key="files" />
            </Tabs>
            <div style={{ flex: "auto", overflow: "hidden" }}>
              <Switch>
                <Route
                  exact
                  path={`${path}/workunits`}
                  render={() => {
                    update((draft) => {
                      draft.activeTab = "workunits";
                    });
                    return <WorkUnitPage />;
                  }}
                />
                <Route
                  path={`${path}/files`}
                  render={() => {
                    update((draft) => {
                      draft.activeTab = "files";
                    });
                    return <FilesPage />;
                  }}
                />
              </Switch>
            </div>
          </OverviewCard>
        </Col>
        <Col style={{ width: 240, height: "calc(50% - 10px)" }} key="users">
          <List
            className="permission-record"
            header={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                团队成员 ( {users?.length ?? 0} )
              </div>
            }
            dataSource={users}
            loading={loadingUsers}
            renderItem={(item) => (
              <ListItem className="permission-record-item">
                <span>
                  <UsergroupAddOutlined /> {item.name}{" "}
                  {/* {team?.ownerId === item.id ? "( 负责人 )" : ""} */}
                </span>
              </ListItem>
            )}
            footer={
              <Button
                type="dashed"
                block
                size="small"
                className="footer-button"
              >
                <Link
                  to={`/projects/${projectId}/settings/collaboration/teams/${teamId}`}
                >
                  查看全部
                  <ArrowRightOutlined />
                </Link>
              </Button>
            }
          />
        </Col>
        <Col
          style={{ width: 240, height: "calc(50% - 10px)" }}
          key="permission"
        >
          <List
            className="permission-record"
            header={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                实时协同团队 ( {permissions?.length ?? 0} )
                <Tooltip
                  placement="bottomRight"
                  title="实时协同团队可以查看、使用本团队已提交的所有数据"
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
            }
            dataSource={permissions}
            loading={loadingPermissions}
            renderItem={(item) => (
              <ListItem className="permission-record-item">
                <span>
                  <UsergroupAddOutlined /> {item.teamName}
                </span>
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.PermissionTeam}
                >
                  <TooltipWrapper
                    when={(tooltipProps) => tooltipProps.disabled ?? false}
                    title="处于示例项目中无该功能权限"
                    placement="bottomRight"
                  >
                    <Button
                      className="delete-btn"
                      type="link"
                      icon={<MinusCircleOutlined />}
                      onClick={() => onDeleteTrustTeams(item.teamId!)}
                    />
                  </TooltipWrapper>
                </CheckPermission>
              </ListItem>
            )}
            footer={
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.PermissionTeam}
              >
                <TooltipWrapper
                  when={(tooltipProps) => tooltipProps.disabled ?? false}
                  title="处于示例项目中无该功能权限"
                >
                  <Button
                    type="dashed"
                    block
                    size="small"
                    className="footer-button"
                    onClick={() => {
                      form.setFieldsValue({
                        selectAddPermissionTeamId: undefined,
                      });
                      update((draft) => {
                        draft.addPermissionVisible = true;
                      });
                    }}
                  >
                    <PlusOutlined />
                    添加实时协同团队
                  </Button>
                </TooltipWrapper>
              </CheckPermission>
            }
          />
        </Col>
      </Row>
      <Modal
        title="添加实时协同团队"
        visible={addPermissionVisible}
        onOk={onTrustTeams}
        onCancel={closePermissionModal}
        width={418}
      >
        <Form form={form}>
          <Form.Item label="团队" name="selectAddPermissionTeamId">
            <Select>
              {teams
                .filter(
                  (item) =>
                    teamId !== item.id &&
                    permissions.findIndex(
                      (resource) => resource.teamId === item.id,
                    ) === -1,
                )
                .map((item) => (
                  <SelectOption key={item.id} value={item.id!}>
                    {item.name}
                  </SelectOption>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Overview;
