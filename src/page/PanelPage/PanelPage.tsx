import {
  AppstoreOutlined,
  BarsOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Affix,
  Tabs,
  Tooltip,
  Layout,
  Menu,
  Avatar,
  Button,
  Space,
  Typography,
  Progress,
  Popover,
  List,
  Tag,
} from "antd";
import { Link, useHistory } from "react-router-dom";
import {
  DataSetVO,
  Project,
  ProjectStatusEnum,
  ProjectVO,
} from "api/generated/model";
import { Select, SelectOption } from "component/Antd";
import { useMe } from "hook/use-user-service.hook";

import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { defaultScrollbarSettings, detectEnv } from "consts";
import { projectService, workUnitService } from "service";
import { useImmer } from "use-immer";
import useCheckMaintenance from "hook/use-check-maintenance.hook";
import useCheckAppVersion from "hook/use-check-appversion";
import qwebService from "service/qweb.service";
import Iconfont from "component/Iconfont";
import panelService from "service/panel.service";
import { MenuItemProps } from "antd/lib/menu/MenuItem";
import Scrollbar from "component/Scrollbar/Scrollbar";
import Scrollbars from "react-custom-scrollbars";
import IssueList, { CreatingIssueInfo } from "./IssuePage/IssueList";
import "./PanelPage.scss";
import ToolsPage from "./ToolsPage/ToolsPage";
import SelectWorkUnitPage from "./SelectWorkUnitPage/SelectWorkUnitPage";
import ReferPage from "./ReferPage";
import PanelPageContext, { ProjectContentEnum } from "./PanelPageContext";

const { Header, Sider } = Layout;

const { TabPane } = Tabs;
enum JobState {
  Waiting = 0,
  Running = 1,
  Success = 2,
  Failure = 3,
}
interface ProgressInfo {
  projectId?: string;
  projectName: string;
  workunitId: string;
  workunitName: string;
  progress: number;
  jobState: JobState;
  key?: string;
  isForPublished?: boolean;
}

interface Job {
  datasetid: string;
  datasetver: number;
  jobstate: JobState;
  isforpublished: boolean;
  createjobtime: string;
}
export interface PanelPageProps {}

export interface State {
  projects: (Project | ProjectVO)[];
  debugResponse: any;
  activeKey: string;
  hidden: boolean;
  creatingIssueInfo?: CreatingIssueInfo;
  progressList: ProgressInfo[];
  totalProgress: number;
  activeProgressNum: number;
  progressListVisible: boolean;
  newProgressList?: Job[];
  allWorkunits: DataSetVO[] | null;
}

interface PanelMenuItemProps extends MenuItemProps {
  tooltip?: string;
}

const count = 0;
const MenuItem = ({ tooltip, ...rest }: PanelMenuItemProps) => (
  <Menu.Item
    {...rest}
    onMouseEnter={(event) => {
      if (tooltip) {
        let obj = event.domEvent.target as any;
        let y = 0; // 获取该元素对应父容器的上边距
        let x = 0; // 对应父容器的上边距
        // 判断是否有父容器，如果存在则累加其边距

        while (obj) {
          // 等效 obj = obj.offsetParent;while (obj != undefined)
          y += obj.offsetTop; // 叠加父容器的上边距
          x += obj.offsetLeft; // 叠加父容器的左边距
          obj = obj.offsetParent;
        }
        if (!x && !y) {
          return;
        }
        panelService.showtooltip({
          x,
          y,
          width: 32,
          height: 32,
          tooltip,
          delay: 1000,
        });
      }
    }}
    onMouseLeave={() => {
      panelService.hidetooltip();
    }}
  />
);

const transProgressStatus = (progress: number) => {
  let status: "active" | "success" | "normal" | "exception" | undefined =
    "active";
  if (progress === -1) {
    status = "exception";
  } else if (progress === 100) {
    status = "success";
  }
  return status;
};

export default function PanelPage(props: PanelPageProps) {
  const {} = props;
  const container = useRef(null);
  const [
    {
      projects,
      progressList,
      totalProgress,
      activeKey,
      hidden,
      creatingIssueInfo,
      activeProgressNum,
      progressListVisible,
      newProgressList,
      allWorkunits,
    },
    updateState,
  ] = useImmer<State>({
    projects: [],
    debugResponse: "",
    activeKey: "1",
    hidden: false,
    progressList: [],
    totalProgress: 0,
    activeProgressNum: 0,
    progressListVisible: false,
    allWorkunits: [],
  });
  const {
    workUnit,
    projectId,
    specialtyType,
    setWorkUnit,
    setProjectId,
    resetProject,
    workUnits,
    openingWorkUnit,
    savingWorkUnit,
    commitingWorkUnit,
    userId,
    showprocess,
    accessToken,
    setShowprocess,
    setProjectContent,
    projectContent,
    setSavingWorkUnit,
    setCommitingWorkUnit,
  } = useContext(PanelPageContext);
  const history = useHistory();
  const { user } = useMe();
  useEffect(() => {
    updateState((draft) => {
      draft.allWorkunits = [
        ...(allWorkunits || []),
        ...(workUnits?.filter(
          (newWorkUnit) =>
            !allWorkunits?.some((item) => item.id === newWorkUnit.id),
        ) || []),
      ];
    });
  }, [workUnits]);
  useEffect(() => {
    if (projectContent === ProjectContentEnum.Samples) {
      projectService.listSampleProjects().then((newProjects) => {
        updateState((draft) => {
          draft.projects = newProjects;
        });
      });
    } else {
      projectService
        .listProjectsByStatus(ProjectStatusEnum.Ongoing)
        .then((newProjects) => {
          updateState((draft) => {
            draft.projects = newProjects;
          });
        });
    }
    resetProject();
  }, [projectContent]);
  useEffect(() => {
    const featureList: any = user?.featureList;
    setShowprocess(featureList?.JobManager === false ? 0 : 1);
  }, [user]);

  useEffect(() => {
    const activeProgressList = progressList.filter(
      (item) => item.progress >= 0 && item.progress < 100,
    );
    updateState((draft) => {
      draft.activeProgressNum = activeProgressList.length;
      draft.totalProgress = activeProgressList.length
        ? activeProgressList.reduce((total, item) => total + item.progress, 0) /
          activeProgressList.length
        : 100;
    });

    const interval = setInterval(async () => {
      updateState((draft) => {
        draft.progressList = progressList.map((item) => {
          const temp = {
            ...item,
            progress:
              item.jobState !== JobState.Waiting &&
              item.progress >= 0 &&
              item.progress < 100
                ? Math.min(item.progress + 2, 99)
                : item.progress,
          };
          return temp;
        });
      });
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [progressList]);
  useEffect(() => {
    panelService.panelresize(hidden ? 32 : 352, hidden);
  }, [hidden]);
  useEffect(() => {
    if (!workUnit) {
      updateState((draft) => {
        draft.activeKey = "1";
      });
    }
  }, [!!workUnit]);
  // useEffect(() => {
  //   if (activeKey === "3") {
  //     updateState((draft) => {
  //       draft.activeKey = "2";
  //     });
  //     setTimeout(() => {
  //       updateState((draft) => {
  //         draft.activeKey = "3";
  //       });
  //     }, 500);
  //   }
  // }, [activeKey]);

  const updateProgressList = useCallback(
    async (newList: Job[]) => {
      const datasetIds = newList
        .map((item) => item.datasetid)
        .filter((item, index, arr) => arr.indexOf(item) === index);

      const getWorkUnitPromiseList = datasetIds.map((datasetId) =>
        workUnitService.getWorkUnitByIdWithDeleted(datasetId),
      );
      const workUnitList = await Promise.all(getWorkUnitPromiseList);
      updateState((draft) => {
        draft.progressList = newList.map((job, index) => {
          const dataset = allWorkunits?.find(
            (item) => item?.id === job.datasetid,
          );
          const dataset2 = workUnitList.find(
            (item) => item?.id === job.datasetid,
          );
          const currentJob = draft.progressList.find(
            (progress) =>
              progress.key === `${job.datasetid}-${job.createjobtime}`,
          );
          return {
            projectId: dataset2?.projectId,
            projectName:
              draft.progressList.find(
                (pro) => pro.projectId === dataset2?.projectId,
              )?.projectName ||
              projects.find((project) => project.id === dataset2?.projectId)
                ?.name ||
              "",
            workunitName: dataset?.name || dataset2?.name || "",
            isForPublished: job.isforpublished,
            progress:
              job.jobstate === JobState.Success
                ? 100
                : job.jobstate === JobState.Failure
                ? -1
                : currentJob?.progress || 0,
            workunitId: dataset?.id || "",
            key: `${job.datasetid}-${job.createjobtime}`,
            jobState: job.jobstate,
          };
        });
      });
    },
    [progressList, allWorkunits],
  );

  useEffect(() => {
    if (newProgressList) {
      updateProgressList(newProgressList);
    }
  }, [newProgressList]);
  useEffect(() => {
    if (progressList?.length) {
      updateState((draft) => {
        draft.hidden = false;
        draft.progressListVisible = true;
      });
    }
  }, [progressList?.length]);
  useEffect(() => {
    const subscription = qwebService.subscribe((e) => {
      console.log("received qt event: ", e);
      // try {
      switch (e.CollaborationClientEvent.actionname) {
        case "panelresized":
          const { minimized, content } = e.CollaborationClientEvent.arguments;
          updateState((draft) => {
            draft.hidden = minimized === "1";
          });
          if (minimized !== "1" && content !== undefined) {
            setProjectContent(content);
          }
          break;
        case "productprobleminfo":
          const {
            datasetid,
            datasetversion,
            elementid,
            elementname,
            markcoordinate,
          } = e.CollaborationClientEvent.arguments;
          // message.info("工作单元已关闭");
          if (activeKey !== "3") {
            updateState((draft) => {
              draft.activeKey = "2";
            });
          }
          setTimeout(() => {
            updateState((draft) => {
              draft.activeKey = "3";
              draft.hidden = false;
              draft.creatingIssueInfo = {
                datasetid,
                datasetversion,
                elementid,
                elementname,
                markcoordinate,
              };
            });
          }, 500);
          break;
        case "workunitprogresslist":
          if (showprocess) {
            setSavingWorkUnit(false);
            setCommitingWorkUnit(false);
            const newList: Job[] =
              e.CollaborationClientEvent.arguments.progresslist;
            // updateProgressList(newList);
            updateState((draft) => {
              draft.newProgressList = newList.sort((a, b) =>
                a.createjobtime > b.createjobtime ? -1 : 1,
              );
            });
          }
          break;
        default:
          break;
      }
      // } catch (e) {
      //   Modal.error({ content: JSON.stringify(e) });
      // }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [updateState, showprocess]);

  const { message, status } = useCheckMaintenance("PANEL");

  const annoHtml = (
    currentStatus:
      | "Running"
      | "PreMaintenance"
      | "PostMaintain"
      | "UnderMaintenance",
  ) => {
    if (currentStatus === "PostMaintain") {
      return (
        <div
          className="anno-line"
          style={{ backgroundColor: "#d9dde4", margin: "8px 6px 0 11px" }}
        >
          <Tooltip
            title={message}
            trigger="hover"
            placement="bottomLeft"
            arrowPointAtCenter
          >
            <CheckCircleFilled style={{ color: "#52c41a" }} />
          </Tooltip>

          <div className="anno">
            <div className="marquee">
              <div className="text" style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                {message}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (currentStatus === "PreMaintenance") {
      return (
        <div
          className="anno-line"
          style={{
            backgroundColor: "#d9dde4",
            margin: "8px 6px 0 11px",
          }}
        >
          <Tooltip
            title={message}
            trigger="hover"
            placement="bottomLeft"
            arrowPointAtCenter
          >
            <ExclamationCircleFilled style={{ color: "#faad14" }} />
          </Tooltip>

          <div className="anno">
            <div className="marquee">
              <div className="text" style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                {message}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const { isAppUsable } = useCheckAppVersion();
  if (!isAppUsable) {
    history.replace("/maintenance?isPanel=true");
  }

  return (
    <Layout className={["panel-page", hidden ? "hidden" : ""].join(" ")}>
      <Sider width={32}>
        <div
          className="hidden-button"
          onClick={() =>
            updateState((draft) => {
              draft.hidden = !hidden;
            })
          }
        >
          {hidden ? <RightOutlined /> : <LeftOutlined />}
        </div>
        <div
          className="avatar-button"
          onClick={() =>
            updateState((draft) => {
              draft.hidden = false;
            })
          }
        >
          <Avatar shape="square" size={24} icon={<UserOutlined />} />
        </div>
        <Menu
          selectedKeys={[activeKey]}
          mode="inline"
          theme="dark"
          inlineCollapsed
          inlineIndent={9}
          onClick={({ key }) => {
            updateState((draft) => {
              draft.activeKey = key?.toString();
              draft.hidden = false;
            });
          }}
        >
          <MenuItem key="1" icon={<BarsOutlined />} tooltip="工作单元">
            {/* 工作单元 */}
          </MenuItem>
          <MenuItem
            key="2"
            disabled={!workUnit}
            icon={<Iconfont type="icon-xietongcanzhao-lianjie" />}
            tooltip="协同参照"
          >
            {/* 协同参照 */}
          </MenuItem>
          <MenuItem
            key="3"
            disabled={!workUnit}
            icon={<QuestionCircleOutlined />}
            tooltip="问题列表"
          >
            {/* 问题列表 */}
          </MenuItem>
          <MenuItem
            key="4"
            disabled={!workUnit}
            icon={<AppstoreOutlined />}
            tooltip="其他"
          >
            {/* 其他 */}
          </MenuItem>
        </Menu>
        {!!showprocess && (
          <Popover
            placement="rightBottom"
            overlayClassName="progress-popover"
            visible={progressListVisible}
            title={
              <>传输列表{activeProgressNum ? `（${activeProgressNum}）` : ""}</>
            }
            onVisibleChange={(visible) =>
              updateState((draft) => {
                draft.progressListVisible = visible;
              })
            }
            content={
              <Scrollbars {...defaultScrollbarSettings}>
                <List
                  dataSource={progressList}
                  renderItem={(data: ProgressInfo) => (
                    <div className="progress-item">
                      <Typography.Text
                        style={{
                          width: 220,
                          flex: "none",
                          overflow: "scroll",
                          // display: "inline-block",
                          margin: 0,
                          marginBottom: -4,
                        }}
                        ellipsis={{
                          tooltip: true,
                        }}
                      >
                        {data.projectName || (
                          <Typography.Text delete>该项目已删除</Typography.Text>
                        )}
                        _{data.workunitName}
                      </Typography.Text>
                      <span className="progress-tip">
                        {data.isForPublished ? "团队协同" : "个人设计"}
                      </span>
                      <Progress
                        className="progress-workunit"
                        percent={data.progress === -1 ? 100 : data.progress}
                        format={(percent) =>
                          data.jobState === JobState.Failure
                            ? "失败"
                            : data.jobState === JobState.Waiting
                            ? "等待中"
                            : `${percent}%`
                        }
                        status={transProgressStatus(data.progress)}
                      />
                    </div>
                  )}
                />
              </Scrollbars>
            }
            trigger="click"
            autoAdjustOverflow={false}
          >
            <div
              className={`progress-button ${progressListVisible && "active"}`}
              onClick={() =>
                updateState((draft) => {
                  draft.hidden = false;
                })
              }
            >
              <Progress
                className="progress-workunit"
                strokeLinecap="square"
                percent={progressList.length && totalProgress}
                showInfo={false}
                strokeWidth={14}
                status={transProgressStatus(totalProgress)}
              />
            </div>
          </Popover>
        )}
      </Sider>
      <div className="container" ref={container}>
        <Header className="panel-header">
          <div className="title">
            <span className="logo">云协同</span>

            <div className="env-tag">
              {detectEnv() !== "gteam" && (
                <Tag color="success">{detectEnv()}环境</Tag>
              )}
            </div>

            <Button
              className="goto-platform"
              size="small"
              type="primary"
              ghost
              onClick={() => {
                const query = `?accessToken=${userId}&userId=${accessToken}`;
                panelService.openbrowser(
                  `${window.location.protocol}//${window.location.host}/${
                    projectId
                      ? `web/projects/${projectId}/personal/work-units`
                      : `workspace`
                  }${query}`,
                );
              }}
            >
              前往平台
            </Button>
          </div>
          <Space className="user-info">
            <Avatar shape="square" size={48} icon={<UserOutlined />} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography.Text
                className="username"
                style={{
                  flex: "none",
                  overflow: "scroll",
                  // display: "inline-block",
                  margin: 0,
                  marginBottom: -4,
                }}
                ellipsis={{
                  tooltip: true,
                }}
              >
                {user?.name}
              </Typography.Text>
              <div className="info">您好，欢迎使用广联达设计</div>

              {/* <div className="summary">{user?.telephone}</div> */}
            </div>
            <Button
              className="logout-button"
              type="link"
              onClick={() => {
                panelService.logout();
              }}
            >
              退出账号
            </Button>
          </Space>
          {status !== "Running" && annoHtml(status)}
        </Header>
        {activeKey === "1" && (
          <Tabs
            className="toolbar-tabs project-content"
            size="small"
            onChange={(key) => {
              setProjectContent(
                (key as ProjectContentEnum) || ProjectContentEnum.Mine,
              );
            }}
            activeKey={projectContent?.toString() || ProjectContentEnum.Mine}
          >
            <TabPane
              key={ProjectContentEnum.Mine}
              tab="我的项目"
              disabled={
                !!workUnit && ProjectContentEnum.Mine !== projectContent
              }
            />
            <TabPane
              key={ProjectContentEnum.Samples}
              tab="示例项目"
              disabled={
                !!workUnit && ProjectContentEnum.Samples !== projectContent
              }
            />
          </Tabs>
        )}
        <div
          className={["tabs", activeKey === "1" ? "workunit" : ""].join(" ")}
        >
          {activeKey === "1" && (
            <>
              <div className="project-list">
                <span>项目选择：</span>
                <Select
                  showSearch
                  optionFilterProp="children"
                  size="small"
                  className="project-select"
                  placeholder="请选择项目"
                  value={projectId}
                  disabled={!!workUnit}
                  onChange={(val) => setProjectId(val)}
                >
                  {projects.map((pj: any) => (
                    <SelectOption key={pj.id} value={pj.id!}>
                      {pj.name}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </>
          )}
          <Tabs
            type="card"
            className="toolbar-tabs"
            activeKey={activeKey}
            renderTabBar={(_, DefaultTabBar) => (
              <Affix offsetTop={0} target={() => container.current}>
                <DefaultTabBar {..._} className="site-custom-tab-bar" />
              </Affix>
            )}
          >
            <TabPane key="1" forceRender>
              {/* <FakeProgress completed={false} step={20} onCompleted={console.log} /> */}
              <SelectWorkUnitPage activeKey={activeKey} />
            </TabPane>
            <TabPane key="2" forceRender>
              <ReferPage activeKey={activeKey} />
            </TabPane>
            <TabPane disabled={!workUnit} key="3" forceRender>
              <IssueList
                activeKey={activeKey}
                creatingIssueInfo={creatingIssueInfo}
              />
            </TabPane>
            <TabPane disabled={!workUnit} key="4">
              <ToolsPage activeKey={activeKey} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
