import {
  DownOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRequest } from "@umijs/hooks";

import consts from "consts";
import {
  Card,
  Space,
  Progress,
  Affix,
  Skeleton,
  Tabs,
  Dropdown,
  Menu,
  Popover,
  Modal,
  message,
  Tooltip,
  Typography,
  Checkbox,
} from "antd";
import {
  Project,
  ProjectCreation,
  ProjectStatusEnum,
  ProjectVO,
  ResourceLimitVO,
  ProjectDeletableNonDeletableTypeEnum,
} from "api/generated/model";
import { Table } from "component/Antd";
import Button from "component/Button";
import { onResponseError } from "function/auth.func";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { curry, orderBy, size, trim } from "lodash";
import React, { useEffect, createContext, FC } from "react";
import {
  enterpriseService,
  projectService,
  roleService,
  userService,
} from "service";
import { QueryParamConfig, useQueryParam } from "use-query-params";
import ProjectActionModal from "page/ProjectPage/ProjectSettingsPage/ProjectInfoSettingsPage/ProjectActionModal";
import "./WorkspacePage.scss";
import ProjectHeader from "page/ProjectPage/ProjectPageComponents/ProjectHeader";
import TweenOne from "rc-tween-one";
import { useImmer } from "use-immer";
import QueueAnim from "rc-queue-anim";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { defaultDateTimeFromString } from "function/date.func";
import { ColumnsType } from "antd/lib/table";
import { ProjectRole } from "service/role.service";
import { EnterpriseMember } from "api-auth/generated/model";
import { formatByte } from "function/number.func";
import { publishEvent } from "function/stats.func";
import Iconfont from "component/Iconfont";
import SelectAdminModal from "./SelectAdminModal";
import ProjectFilter from "./ProjectFilter";
import ProjectEmptyWrapper from "./ProjectEmptyWrapper";
import PersonalProjects from "./PersonalProjects";
import HelpStep from "./HelpStep";

const { PUBLIC_URL, AUTH_BASE_URL, NESTBIM_BASE_URL } = consts;
export const StatusParam: QueryParamConfig<ProjectStatusEnum[] | undefined> = {
  encode: (value?: ProjectStatusEnum[]) => value?.toString(),
  /** Convert the query param string value to its native type */
  decode: (value: string | (string | null)[] | null | undefined) => {
    if (!value) {
      return undefined;
    }
    if (typeof value === "string") {
      return value.split(",") as ProjectStatusEnum[];
    }
    return (value as ProjectStatusEnum[]) || undefined;
  },
};

const ChildrenPlugin = require("rc-tween-one/lib/plugin/ChildrenPlugin");

TweenOne.plugins.push(ChildrenPlugin);

export const projectStatusList = [
  { value: "", label: "全部" },
  { value: ProjectStatusEnum.Ongoing, label: "进行中" },
  { value: ProjectStatusEnum.Suspended, label: "暂停中" },
  { value: ProjectStatusEnum.Completed, label: "已完成" },
];
interface CountAnimation {
  Children: {
    value: number;
    floatLength: number;
    type: ProjectStatusEnum | "";
  };
  duration: number;
}

const softList = [
  {
    title: "GARCH",
    key: "garch",
    label: "建筑设计",
    // icon: `${PUBLIC_URL}/assets/images/GARCH.png`,
    img: `${PUBLIC_URL}/garch_logo.png`,
    link: `${PUBLIC_URL}/download/garch`,
  },
  {
    title: "GSTR",
    key: "gstr",
    label: "结构设计",
    // icon: `${PUBLIC_URL}/assets/images/GSTR.png`,
    img: `${PUBLIC_URL}/gstr_logo.png`,
    link: `${PUBLIC_URL}/download/gstr`,
  },
  {
    title: "GMEP",
    key: "gmep",
    label: "机电设计",
    // icon: `${PUBLIC_URL}/assets/images/GMEP.png`,
    img: `${PUBLIC_URL}/gmep_logo.png`,
    link: `${PUBLIC_URL}/download/gmep`,
  },
];
const helpList = [
  {
    title: "平台介绍",
    label: "协同设计平台全新上线！",
    icon: `icon-pingtaijieshao`,
    link: `${NESTBIM_BASE_URL}/software/GDCP`,
  },
  {
    title: "视频教程",
    label: "快速上手协同设计平台！",
    icon: `icon-shipinjiaocheng`,
    link: `${PUBLIC_URL}/videos/gdcp`,
  },
  {
    title: "案例项目",
    label: "点击观看完整案例项目视频",
    icon: `icon-anlixiangmu`,
    link: `${PUBLIC_URL}/videos/cases`,
  },
];

export enum ViewType {
  Manage = "manage",
  Personal = "personal",
}

export const ViewTypeParam: QueryParamConfig<ViewType | undefined> = {
  encode: (value: ViewType | undefined) => value,
  /** Convert the query param string value to its native type */
  decode: (value: string | (string | null)[] | null | undefined) => {
    switch (value) {
      case ViewType.Manage:
        return ViewType.Manage;
      case ViewType.Personal:
        return ViewType.Personal;
      default:
        return ViewType.Manage;
    }
  },
};

interface WorkspacePageProps {}
interface WorkspacePageState {
  accountAnimation?: CountAnimation;
  countAnimations?: CountAnimation[];
  showCreate: boolean;
  showSelectAdmin: boolean;
  currentCapacity: number;
  editingProject?: Project | ProjectVO;
  isInit: boolean;
  isPageTween?: boolean;
  projectType: ("joined" | "created")[];
}
const onEnd = (e: any) => {
  const dom = e.target;
  dom.style.height = "auto";
};
const enterAnim = [
  {
    opacity: 0,
    x: 30,
    backgroundColor: "#fffeee",
    duration: 0,
  },
  {
    height: 0,
    duration: 200,
    type: "from",
    delay: 250,
    ease: "easeOutQuad",
    onComplete: onEnd,
  },
  {
    opacity: 1,
    x: 0,
    duration: 250,
    ease: "easeOutQuad",
  },
  { delay: 1000, backgroundColor: "#fff" },
];
const pageEnterAnim = [
  {
    opacity: 0,
    duration: 0,
  },
  {
    height: 0,
    duration: 150,
    type: "from",
    delay: 150,
    ease: "easeOutQuad",
    onComplete: onEnd,
  },
  {
    opacity: 1,
    duration: 150,
    ease: "easeOutQuad",
  },
];
const leaveAnim = [
  { duration: 250, opacity: 0 },
  { height: 0, duration: 200, ease: "easeOutQuad" },
];
const pageLeaveAnim = [
  { duration: 150, opacity: 0 },
  { height: 0, duration: 150, ease: "easeOutQuad" },
];

export default function WorkSpacePage(props: WorkspacePageProps) {
  const [
    {
      countAnimations,
      showCreate,
      currentCapacity,
      accountAnimation,
      editingProject,
      isInit,
      showSelectAdmin,
      projectType,
    },
    updateState,
  ] = useImmer<WorkspacePageState>({
    showCreate: false,
    currentCapacity: 0,
    accountAnimation: {
      Children: {
        value: 0,
        floatLength: 0,
        type: "",
      },
      duration: 1000,
    },
    isInit: false,
    showSelectAdmin: false,
    projectType: [],
  });
  const { breadCrumbs } = useBreadCrumbs("项目列表", "workspace", "/workspace");
  const [{ currentUser }] = useRecoilState(projectPageState);
  const [projectStatus, setProjectStatus] = useQueryParam(
    "projectStatus",
    StatusParam,
  );
  const [viewType, setViewType] = useQueryParam("viewType", ViewTypeParam);

  const loader = (status?: ProjectStatusEnum) =>
    projectService
      .listProjects(status || undefined)
      .then((projects) => orderBy(projects, "creationTime").reverse());
  const ownerProjectsLoader = () =>
    projectService
      .ownerProjects()
      .then((projects) => orderBy(projects, "creationTime").reverse());

  const { data: projects, loading, run } = useRequest<Project[]>(loader, {
    manual: true,
  });
  const {
    data: sampleProjects,
    loading: sampleProjectsLoading,
    run: laodSampleProjects,
  } = useRequest<Project[]>(() => projectService.listSampleProjects(), {
    manual: true,
  });
  const {
    data: ownerProjects,
    loading: ownerProjectsloading,
    run: runLoadOwnerProjects,
  } = useRequest<ProjectVO[]>(ownerProjectsLoader, {
    manual: true,
  });

  const memberLoader = () =>
    enterpriseService
      .getSubAccounts()
      .then((members) => orderBy(members, "creationTime").reverse());
  const { data: members, run: loadMember } = useRequest<EnterpriseMember[]>(
    memberLoader,
    {
      manual: true,
    },
  );
  const resourceLimitLoader = () => userService.resourceLimit();
  const {
    data: resourceLimit,
    run: loadResourceLimit,
  } = useRequest<ResourceLimitVO>(resourceLimitLoader, {
    manual: true,
  });
  const refresh = () => {
    if (viewType === ViewType.Manage || currentUser?.isPersonalAccount) {
      runLoadOwnerProjects();
    }
    if (viewType === ViewType.Manage) {
      loadMember();
    } else {
      run("");
    }
    laodSampleProjects();
  };
  useEffect(() => {
    refresh();
  }, [viewType, currentUser?.isPersonalAccount]);
  useEffect(() => {
    updateState((draft) => {
      draft.accountAnimation = {
        Children: {
          value: members?.length || 0,
          floatLength: 0,
          type: "",
        },
        duration: 1000,
      };
    });
  }, [members]);
  useEffect(() => {
    if (currentUser && currentUser.id) {
      if (!currentUser.isMainAccount) {
        setViewType(ViewType.Personal);
        // } else {
        //   setViewType(ViewType.Manage);
      }
      loadResourceLimit();
    }
  }, [currentUser?.id]);
  useEffect(() => {
    if (ownerProjects) {
      const reduceNum = ownerProjects.reduce(
        (count, project) => ({
          [ProjectStatusEnum.Ongoing]:
            count[ProjectStatusEnum.Ongoing] +
            Number(project.status === ProjectStatusEnum.Ongoing),
          [ProjectStatusEnum.Suspended]:
            count[ProjectStatusEnum.Suspended] +
            Number(project.status === ProjectStatusEnum.Suspended),
          [ProjectStatusEnum.Completed]:
            count[ProjectStatusEnum.Completed] +
            Number(project.status === ProjectStatusEnum.Completed),
        }),
        {
          [ProjectStatusEnum.Ongoing]: 0,
          [ProjectStatusEnum.Suspended]: 0,
          [ProjectStatusEnum.Completed]: 0,
        },
      );
      updateState((draft) => {
        draft.currentCapacity = ownerProjects.reduce(
          (result, project) => result + (project.size || 0),
          0,
        );
        draft.isInit = true;
        draft.countAnimations = [
          {
            Children: {
              value: ownerProjects.length || 0,
              floatLength: 0,
              type: "",
            },
            duration: 1000,
          },
          {
            Children: {
              value: reduceNum[ProjectStatusEnum.Ongoing] || 0,
              floatLength: 0,
              type: ProjectStatusEnum.Ongoing,
            },
            duration: 1000,
          },
          {
            Children: {
              value: reduceNum[ProjectStatusEnum.Suspended] || 0,
              floatLength: 0,
              type: ProjectStatusEnum.Suspended,
            },
            duration: 1000,
          },
          {
            Children: {
              value: reduceNum[ProjectStatusEnum.Completed] || 0,
              floatLength: 0,
              type: ProjectStatusEnum.Completed,
            },
            duration: 1000,
          },
        ];
      });
    }
  }, [ownerProjects]);
  useEffect(() => {
    if (projects) {
      updateState((draft) => {
        draft.isInit = true;
      });
    }
  }, [projects]);

  const createProject = (info: Project) =>
    projectService.createNewProject(info).then(() => {
      runLoadOwnerProjects("");
      run();
      message.success("项目创建成功");
      updateState((draft) => {
        draft.showCreate = false;
      });
      // publishEvent(
      //   `创建${currentUser?.isPersonalAccount ? "" : "企业"}项目`,
      //   [
      //     "工作台",
      //     `${currentUser?.isPersonalAccount ? "个人" : "企业"}账号工作台`,
      //   ],
      //   { eventLevel: "P1" },
      // );
    });

  const onEdit = (info: Project) =>
    projectService.modifyProject(info).then(() => {
      runLoadOwnerProjects();
      run();
      updateState((draft) => {
        draft.showCreate = false;
        draft.editingProject = undefined;
      });
      message.success("项目信息修改成功");
    });

  const onDelete = (projectId: string, name: string) => {
    projectService.isDeletable(projectId).then((resp) => {
      if (resp.data?.deletable) {
        Modal.confirm({
          title: "确认删除",
          content: `删除项目将清除项目内所有数据且无法恢复，请确认是否删除项目 ${name} ？`,
          okText: "继续",
          okButtonProps: { danger: true },
          cancelText: "取消",
          onOk() {
            return projectService
              .deleteProject(projectId)
              .then(() => {
                runLoadOwnerProjects();
                run();
                publishEvent(
                  `deleteProject`,
                  [
                    "工作台",
                    `${
                      currentUser?.isPersonalAccount ? "个人" : "企业"
                    }账号工作台`,
                  ],
                  {
                    eventLevel: "P2",
                    from: `${
                      viewType === ViewType.Manage ? "企业" : "个人"
                    }工作台`,
                  },
                );
              })
              .catch((err) => {
                message.error(err?.response?.msg ?? "系统错误");
              });
          },
        });
      } else {
        message.error(resp.msg);
        if (
          resp.data?.nonDeletableType ===
          ProjectDeletableNonDeletableTypeEnum.DELETEDPROJECT
        ) {
          runLoadOwnerProjects();
        }
      }
    });
  };

  // if (loading || !projects) {
  //   return (
  //     <div className="workspace-page">
  //       <Loading absolute={true} size={64} />
  //     </div>
  //   );
  // }

  const isEmpty = size(projects) === 0;
  const isOwnerProjectsEmpty = size(ownerProjects) === 0;

  const optionButtons = (project: Project | ProjectVO) => [
    <Button
      key="edit"
      style={{
        minWidth: 0,
        ...(currentUser?.isPersonalAccount
          ? { color: "rgba(0, 0, 0, 0.65)" }
          : {}),
      }}
      type="link"
      onClick={(e) => {
        e.preventDefault();
        updateState((draft) => {
          draft.showCreate = true;
          draft.editingProject = project;
        });
      }}
    >
      编辑
    </Button>,
    <Button
      key="delete"
      danger
      style={{ minWidth: 0 }}
      type="link"
      onClick={(e) => {
        e.preventDefault();
        if (project?.id) {
          onDelete(project?.id, project?.name ?? "");
        }
      }}
    >
      删除
    </Button>,
  ];

  const columns: ColumnsType<Project> = [
    {
      title: "项目名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text) =>
        projectStatusList.find((status) => status.value === text)?.label || "-",
    },
    {
      title: "封面",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (thumbnail) =>
        (thumbnail && (
          <Popover content={<img style={{ maxWidth: 600 }} src={thumbnail} />}>
            <div
              className="thumbnail-small"
              style={{ backgroundImage: `url(${thumbnail})` }}
            />
          </Popover>
        )) ||
        "-",
    },
    {
      title: "创建时间",
      dataIndex: "creationTime",
      key: "creationTime",
      render: (time) => defaultDateTimeFromString(time),
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      align: "right",
      render: (value) => formatByte(value),
    },
    {
      title: "项目简介",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    ...(!currentUser?.isPersonalAccount
      ? [
          {
            title: "参与状态",
            dataIndex: "isUserJoined",
            key: "isUserJoined",
            render: (joined: boolean) => `${joined ? "已" : "未"}参与`,
          },
        ]
      : []),
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (_, project) => (
        <Space>
          {optionButtons(project)}
          {!currentUser?.isPersonalAccount && (
            <>
              <Button
                type="link"
                onClick={() => {
                  updateState((draft) => {
                    draft.showSelectAdmin = true;
                    draft.editingProject = project;
                  });
                }}
              >
                设置管理员
              </Button>
              <Button
                type="link"
                disabled={project.isUserJoined}
                onClick={() => {
                  if (!currentUser?.isProjectParticipant) {
                    message.warning(
                      "参与项目失败，请先前往个人中心修改账号设置",
                    );
                    return;
                  }
                  Modal.confirm({
                    title: "快速参与项目",
                    content: `您是否确定以项目管理员身份参与"${project.name}" ?`,
                    async onOk() {
                      await projectService.addUserToProject(
                        currentUser?.id!,
                        project.id!,
                      );
                      await roleService.editUserRole(
                        project.id!,
                        [ProjectRole.ProjectAdmin],
                        currentUser?.id!,
                      );
                      runLoadOwnerProjects();
                    },
                  });
                }}
              >
                参与项目
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const creatButton = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        if (
          resourceLimit?.projectNumber &&
          ownerProjects &&
          ownerProjects?.length >= resourceLimit?.projectNumber
        ) {
          message.error("您的项目已达上限数量，请联系客服调整限制");
          return;
        }
        updateState((draft) => {
          draft.showCreate = true;
          draft.editingProject = undefined;
        });
      }}
    >
      创建项目
    </Button>
  );

  const progress = resourceLimit?.spaceSize
    ? (currentCapacity / (resourceLimit?.spaceSize * 1024 * 1024 * 1024)) * 100
    : 0;

  const projectStatusChangeHandler = (status: ProjectStatusEnum[]) => {
    publishEvent(
      `filterProject`,
      [
        "工作台",
        `${currentUser?.isPersonalAccount ? "个人" : "企业"}账号工作台`,
      ],
      {
        eventLevel: "P3",
        query: "项目状态",
      },
    );
    setProjectStatus(status);
  };

  const personalProjects = [
    ...(projectType?.includes("joined") || !projectType?.length
      ? projects?.filter((p) => !ownerProjects?.some((op) => op.id === p.id)) ||
        []
      : []),
    ...(projectType?.includes("created") || !projectType?.length
      ? ownerProjects?.map((op) => ({
          ...op,
          ...(projects?.find((p) => p.id === op.id) || {}),
        })) || []
      : []),
  ]?.filter((op, i, arr) => arr.findIndex((p) => p.id === op.id) === i);
  return (
    <div className="workspace-page">
      <Affix>
        <ProjectHeader
          title={
            currentUser?.isMainAccount ? (
              currentUser?.isProjectParticipant ? (
                <Dropdown
                  overlayClassName="switch-view-type-dropdown"
                  overlay={
                    <Menu
                      className="switch-view-type"
                      onClick={({ key }) => {
                        if (key !== viewType) {
                          setViewType(key as ViewType);
                        }
                      }}
                      selectedKeys={viewType && [viewType]}
                    >
                      <Menu.Item key={ViewType.Manage}>企业工作台</Menu.Item>
                      <Menu.Item key={ViewType.Personal}>个人工作台</Menu.Item>
                    </Menu>
                  }
                >
                  <span style={{ cursor: "pointer" }}>
                    {viewType === ViewType.Manage ? "企业工作台" : "个人工作台"}
                    <DownOutlined style={{ marginLeft: 4 }} />
                  </span>
                </Dropdown>
              ) : (
                "企业工作台"
              )
            ) : (
              "个人工作台"
            )
          }
          needBack={false}
        />
      </Affix>
      <div
        className={[
          "info-header",
          currentUser?.isPersonalAccount ? "personal" : "",
        ].join(" ")}
        style={{
          backgroundImage: `url(${PUBLIC_URL}/assets/images/banner${
            currentUser?.isPersonalAccount ? "-personal@2x.png" : "@2x.jpg"
          })`,
        }}
      >
        <h2>Hi，{currentUser?.name}，欢迎使用广联达协同设计平台</h2>
        <span className="info">
          立足全专业全过程数字化设计，打造全数字化样品，构建中国建筑设计互联网平台和设计市场生态
        </span>
      </div>
      <main>
        <Space size={16} className="workspace-cards">
          <QueueAnim
            type={["left", "left"]}
            delay={[450, 0]}
            // ease={["easeOutQuart", "easeInOutQuart"]}
          >
            <div style={{ width: "100%" }} key={viewType as string}>
              {viewType === ViewType.Manage && (
                <Card
                  className="workspace-card left-card workspace-header"
                  key={ViewType.Manage}
                >
                  <Skeleton
                    active
                    loading={!isInit}
                    title={false}
                    paragraph={{ rows: 2 }}
                  >
                    {countAnimations?.map((countAnimation, i) => (
                      <div
                        className="project-count"
                        key={countAnimation.Children.type || "all"}
                      >
                        <span
                          className={[
                            "count-label",
                            countAnimation.Children.type || "all",
                          ].join(" ")}
                        >
                          {countAnimation.Children.type === ""
                            ? "项目总数"
                            : projectStatusList.find(
                                (status) =>
                                  status.value === countAnimation.Children.type,
                              )?.label}
                        </span>
                        <span className="count">
                          <TweenOne animation={countAnimation} component="span">
                            0
                          </TweenOne>
                          {countAnimation.Children.type === "" &&
                          resourceLimit?.projectNumber ? (
                            <span className="count-total">
                              /{resourceLimit?.projectNumber}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    ))}
                  </Skeleton>
                </Card>
              )}
              <Card
                className={[
                  "workspace-card",
                  "left-card",
                  viewType === ViewType.Manage ? "manage" : "personal",
                ].join(" ")}
              >
                <Skeleton loading={!isInit} paragraph={{ rows: 6 }} active>
                  <Tabs defaultActiveKey="projectList" onChange={refresh}>
                    {viewType === ViewType.Manage && (
                      <Tabs.TabPane tab="项目管理" key="projectList">
                        <ProjectEmptyWrapper
                          isEmpty={isOwnerProjectsEmpty}
                          creatButton={creatButton}
                        >
                          <ProjectFilter
                            projects={ownerProjects}
                            onStatusChange={projectStatusChangeHandler}
                            projectStatus={projectStatus}
                            creatButton={creatButton}
                          />
                          <Table
                            className="anim-table"
                            rowKey={(record) => record.id}
                            columns={columns}
                            style={{ marginTop: 12 }}
                            dataSource={ownerProjects?.filter((project) =>
                              projectStatus?.toString()
                                ? projectStatus?.includes(
                                    project.status as ProjectStatusEnum,
                                  )
                                : true,
                            )}
                            pagination={false}
                          />
                        </ProjectEmptyWrapper>
                      </Tabs.TabPane>
                    )}
                    {viewType === ViewType.Personal && (
                      <Tabs.TabPane
                        tab={
                          currentUser?.isPersonalAccount
                            ? "我的项目"
                            : "我参与的"
                        }
                        key="myProjects"
                      >
                        <ProjectEmptyWrapper
                          isEmpty={isEmpty}
                          creatButton={
                            currentUser?.isPersonalAccount && creatButton
                          }
                        >
                          {currentUser?.isPersonalAccount && (
                            <div
                              className="inline-header"
                              style={{ marginBottom: 8 }}
                            >
                              <span>
                                项目来源：
                                <Checkbox.Group
                                  options={[
                                    { value: "created", label: "我创建的" },
                                    { value: "joined", label: "我合作的" },
                                  ]}
                                  onChange={(checkedValue) => {
                                    updateState((draft) => {
                                      draft.projectType = checkedValue as any;
                                    });
                                    publishEvent(
                                      `filterProject`,
                                      [
                                        "工作台",
                                        `${
                                          currentUser?.isPersonalAccount
                                            ? "个人"
                                            : "企业"
                                        }账号工作台`,
                                      ],
                                      {
                                        eventLevel: "P3",
                                        query: "创建/参与",
                                      },
                                    );
                                  }}
                                />
                              </span>
                              {creatButton}
                            </div>
                          )}
                          <ProjectFilter
                            type={
                              currentUser?.isPersonalAccount
                                ? "checkbox"
                                : "radio"
                            }
                            projects={
                              currentUser?.isPersonalAccount
                                ? (personalProjects as any)
                                : projects
                            }
                            onStatusChange={projectStatusChangeHandler}
                            projectStatus={projectStatus}
                          />
                          <PersonalProjects
                            projectList={
                              currentUser?.isPersonalAccount
                                ? (personalProjects as any)
                                : projects
                            }
                            optionButtons={optionButtons}
                          />
                        </ProjectEmptyWrapper>
                      </Tabs.TabPane>
                    )}
                    <Tabs.TabPane tab="示例项目" key="sampleProjects">
                      <PersonalProjects projectList={sampleProjects} isSample />
                    </Tabs.TabPane>
                  </Tabs>
                </Skeleton>
              </Card>
            </div>
          </QueueAnim>

          <QueueAnim
            // type={["left", "right"]}
            delay={[450, 0]}
            // ease={["easeOutQuart", "easeInOutQuart"]}
          >
            <div key={viewType as string}>
              {viewType === ViewType.Manage && (
                <Card
                  className="workspace-card right-card account-card"
                  title="已创建账号"
                >
                  <Skeleton loading={!isInit} paragraph={{ rows: 2 }} active>
                    <TweenOne animation={accountAnimation} component="span">
                      0
                    </TweenOne>
                    <a
                      href={`${AUTH_BASE_URL}/web/userinfo`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        publishEvent(
                          `manageProject`,
                          ["工作台", `企业账号工作台`],
                          { eventLevel: "P1" },
                        );
                      }}
                    >
                      <Button>前往管理</Button>
                    </a>
                  </Skeleton>
                </Card>
              )}
              {(viewType === ViewType.Manage ||
                currentUser?.isPersonalAccount) && (
                <Card
                  className="workspace-card right-card"
                  title={
                    <Space>
                      {currentUser?.isPersonalAccount ? "使用情况" : "空间容量"}
                      {!currentUser?.isPersonalAccount && (
                        <Tooltip
                          title="数据存储优化中，容量值可能在一定范围内波动"
                          trigger="hover"
                        >
                          <InfoCircleOutlined style={{ color: "#13c2c2" }} />
                        </Tooltip>
                      )}
                    </Space>
                  }
                >
                  <Skeleton loading={!isInit} paragraph={{ rows: 1 }} active>
                    {currentUser?.isPersonalAccount && (
                      <>
                        <h4
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>
                            <Iconfont
                              type="icon-kechuangjianxiangmushuliang"
                              style={{ color: "#13c2c2", marginRight: 8 }}
                            />
                            可创建项目数
                            <Tooltip
                              title="如需增加额度，请联系工作人员"
                              trigger="hover"
                            >
                              <InfoCircleOutlined
                                style={{
                                  color: "rgba(0, 0, 0, 0.65)",
                                  marginLeft: 8,
                                }}
                              />
                            </Tooltip>
                          </span>
                          <span>
                            {ownerProjects?.length || 0}
                            {" / "}
                            {resourceLimit?.projectNumber}
                          </span>
                        </h4>
                        <Progress
                          strokeColor={
                            (ownerProjects?.length || 0) /
                              (resourceLimit?.projectNumber || 1) <
                            1
                              ? "#13c2c2"
                              : "red"
                          }
                          percent={
                            ((ownerProjects?.length || 0) /
                              (resourceLimit?.projectNumber || 1)) *
                            100
                          }
                          showInfo={false}
                          style={{ marginBottom: 16 }}
                        />
                      </>
                    )}
                    <h4
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        <Iconfont
                          type="icon-kongjianrongliang1"
                          style={{ color: "#13c2c2", marginRight: 8 }}
                        />
                        {currentUser?.isPersonalAccount ? "空间容量" : "已用："}
                        {currentUser?.isPersonalAccount && (
                          <Tooltip
                            title="数据存储优化中，容量值可能在一定范围内波动"
                            trigger="hover"
                          >
                            <InfoCircleOutlined
                              style={{
                                color: "rgba(0, 0, 0, 0.65)",
                                marginLeft: 8,
                              }}
                            />
                          </Tooltip>
                        )}
                      </span>
                      <span>
                        <span
                          style={{ color: progress < 90 ? "inherit" : "red" }}
                        >
                          {progress < 100
                            ? formatByte(currentCapacity)
                            : "空间已满"}
                        </span>
                        {" / "}
                        {resourceLimit?.spaceSize
                          ? `${resourceLimit?.spaceSize}G`
                          : "无限"}
                      </span>
                    </h4>
                    <Progress
                      strokeColor={progress < 90 ? "#13c2c2" : "red"}
                      percent={progress}
                      showInfo={false}
                    />
                  </Skeleton>
                </Card>
              )}

              <Card
                className="workspace-card right-card soft-card"
                title="相关软件"
              >
                <QueueAnim delay={300} className="queue-simple-soft">
                  {softList.map((soft) => (
                    <div key={soft.title} className="line">
                      <a style={{ cursor: "default" }}>
                        {/* <a href={soft.link} target="_blank" rel="noreferrer"> */}
                        <img src={soft.img} />
                      </a>
                      <div>
                        <a
                          href={`${PUBLIC_URL}/videos/${soft.key}`}
                          onClick={() => {
                            publishEvent(`viewCourseMotive`, ["基础"], {
                              eventLevel: "P2",
                              videoType: soft.label,
                            });
                          }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button>教程</Button>
                        </a>
                        <a
                          href={soft.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            publishEvent(`downloadMotive`, ["基础"], {
                              eventLevel: "P1",
                              softType: soft.label,
                            });
                          }}
                        >
                          <Button>下载</Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </QueueAnim>
              </Card>
              <Card
                className="workspace-card right-card help-card"
                title="使用帮助"
              >
                <QueueAnim delay={300} className="queue-simple-help">
                  {helpList.map((help) => (
                    <a
                      key={help.title}
                      className="help"
                      href={help.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        publishEvent(
                          help.title === "视频教程"
                            ? `viewCourseMotive`
                            : help.title === "平台介绍"
                            ? "platformIntroduction"
                            : "projectCase",
                          ["基础"],
                          {
                            eventLevel: help.title === "视频教程" ? "P2" : "P3",
                            videoType:
                              help.title === "视频教程"
                                ? "协同平台"
                                : undefined,
                          },
                        );
                      }}
                    >
                      <h4>
                        <Iconfont type={help.icon} />
                        {help.title}
                      </h4>
                      <span className="info">{help.label}</span>
                    </a>
                  ))}
                </QueueAnim>
              </Card>
            </div>
          </QueueAnim>
        </Space>
      </main>
      <ProjectActionModal
        type={editingProject ? "edit" : "new"}
        visible={showCreate}
        projectId={editingProject?.id ?? ""}
        onClose={() =>
          updateState((draft) => {
            draft.showCreate = false;
            draft.editingProject = undefined;
          })
        }
        onOK={(info) => (editingProject ? onEdit(info) : createProject(info))}
      />
      <SelectAdminModal
        visible={!!showSelectAdmin}
        project={editingProject}
        onCancel={() =>
          updateState((draft) => {
            draft.showSelectAdmin = false;
            draft.editingProject = undefined;
          })
        }
      />
      <HelpStep type={viewType} />
    </div>
  );
}
