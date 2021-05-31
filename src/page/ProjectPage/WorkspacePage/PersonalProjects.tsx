/* eslint-disable react/no-array-index-key */
import { EllipsisOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Divider,
  message,
  Tag,
  Typography,
  Row,
  Dropdown,
  Menu,
  Tooltip,
} from "antd";
import { Project, ProjectStatusEnum, ProjectVO } from "api/generated/model";
import Button from "component/Button";
import Iconfont from "component/Iconfont";
import consts from "consts";
import { defaultDateTimeFromString } from "function/date.func";
import { formatByte } from "function/number.func";
import { publishEvent } from "function/stats.func";
import { trim } from "lodash";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { useQueryParam } from "use-query-params";
import { StatusParam, ViewType, ViewTypeParam } from "./WorkspacePage";

const { PUBLIC_URL } = consts;

interface PersonalProjectsProps {
  projectList?: (Project | ProjectVO)[];
  isSample?: boolean;
  optionButtons?: (project: Project | ProjectVO) => JSX.Element[];
}

const PersonalProjects: FC<PersonalProjectsProps> = ({
  projectList,
  isSample,
  optionButtons,
}) => {
  const [projectStatus, setProjectStatus] = useQueryParam(
    "projectStatus",
    StatusParam,
  );
  const [viewType, setViewType] = useQueryParam("viewType", ViewTypeParam);
  const [{ currentUser }] = useRecoilState(projectPageState);
  return (
    <div className="project-list">
      <Row gutter={[16, 16]}>
        {projectList
          ?.filter((project) =>
            projectStatus
              ? projectStatus.includes(project.status as ProjectStatusEnum)
              : true,
          )
          ?.map((project) => (
            <Col key={project.id} span={6}>
              <Link
                onClick={(e) => {
                  publishEvent(
                    isSample ? "enterTemplateProject" : `enterMyProject`,
                    [
                      "工作台",
                      `${
                        currentUser?.isPersonalAccount ? "个人" : "企业"
                      }账号工作台`,
                    ],
                    {
                      eventLevel: isSample ? "P2" : "P1",
                      from: `${
                        viewType === ViewType.Manage ? "企业" : "个人"
                      }工作台`,
                    },
                  );
                  if (!isSample && !(project as Project).accessible) {
                    e.preventDefault();
                    message.warning(
                      "暂不支持外部成员进入项目，请联系项目管理员修改权限",
                    );
                  }
                }}
                to={`/projects/${project.id}/overview`}
              >
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    overflow: "hidden",
                    height: 214,
                  }}
                  cover={
                    <div
                      className="project-cover"
                      style={{
                        backgroundImage: `url(${
                          trim(project.thumbnail) ||
                          `${PUBLIC_URL}/assets/images/projectDefault.png`
                        })`,
                      }}
                    >
                      {!isSample && !(project as Project).accessible && (
                        <div
                          className="project-lock-cover"
                          style={{
                            backgroundImage: `url(${`${PUBLIC_URL}/assets/images/project-lock.svg`})`,
                          }}
                        />
                      )}
                      {project.status === ProjectStatusEnum.Ongoing && (
                        <Tag color="blue">进行中</Tag>
                      )}
                      {project.status === ProjectStatusEnum.Completed && (
                        <Tag color="success">已完成</Tag>
                      )}
                      {project.status === ProjectStatusEnum.Suspended && (
                        <Tag>暂停中</Tag>
                      )}
                    </div>
                  }
                >
                  <Card.Meta
                    style={{ margin: -12 }}
                    title={
                      <div>
                        <div
                          style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            wordBreak: "break-all",
                            fontSize: 13,
                            marginBottom: 8,
                          }}
                        >
                          {project.name}
                        </div>
                        <div className="project-info">
                          {isSample ? (
                            <Typography.Paragraph
                              ellipsis={{
                                rows: 1,
                                expandable: false,
                              }}
                              title={project.description}
                            >
                              {project.description || " "}
                            </Typography.Paragraph>
                          ) : (
                            <>
                              <span>
                                <Iconfont type="icon-chuangjianshijian" />{" "}
                                {defaultDateTimeFromString(
                                  project.creationTime,
                                )}
                              </span>
                              {currentUser?.isPersonalAccount &&
                                (project.owner === currentUser.id ? (
                                  <Dropdown
                                    overlay={
                                      <Menu>
                                        {optionButtons?.(project)?.map(
                                          (button, i) => (
                                            <Menu.Item key={`option${i}`}>
                                              {button}
                                            </Menu.Item>
                                          ),
                                        )}
                                      </Menu>
                                    }
                                  >
                                    <a
                                      className="ant-dropdown-link"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      <EllipsisOutlined />
                                    </a>
                                  </Dropdown>
                                ) : (
                                  <Tooltip
                                    placement="bottom"
                                    title={
                                      <>
                                        该项目为他人创建的
                                        <br />
                                        项目，不支持操作
                                      </>
                                    }
                                  >
                                    <Iconfont type="icon-hezuoxiangmu" />
                                  </Tooltip>
                                ))}
                            </>
                          )}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
      </Row>
    </div>
  );
};
export default PersonalProjects;
