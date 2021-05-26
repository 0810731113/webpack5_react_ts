import {
  Button,
  Checkbox,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
} from "antd";
import { Team, User } from "api/generated/model";
import { ProjectParams } from "model/route-params.model";
import React, { useEffect, useState, useContext, useRef } from "react";
import { useRouteMatch } from "react-router";
import { useRecoilValue } from "recoil";
import debounce from "lodash/debounce";
import {
  projectService,
  teamService,
  userService,
  workUnitService,
} from "service";
import projectPageState from "state/project.state";
import { defaultDrawerSettings } from "consts";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import { useImmer } from "use-immer";
import { SelectProps } from "antd/lib/select";
import { CheckOutlined } from "@ant-design/icons";
import { useForm } from "antd/lib/form/Form";
import { Row, Table } from "component/Antd";
import { ok } from "assert";
import { EnterpriseMember } from "api-auth/generated/model";
import { onResponseError } from "function/auth.func";
import { publishEvent } from "function/stats.func";
import EnterpriseUserSelect from "./EnterpriseUserSelect";

interface CreateUnit {
  teamId: string;
  specialtyId: string;
}

export interface AddEnterpriseUserDrawerProps {
  teamId?: string;
  visible: boolean;
  projectUsers: User[];
  teamUsers?: User[];
  onClose: () => void;
  onComplete: () => void;
  refreshProjectUsers?: () => void;
}
export interface AddUserDrawerState {
  selectedRowKeys: (string | number)[];
  selectedUser?: EnterpriseMember;
  createUnits: CreateUnit[];
  addUserId?: string;
}

export default function AddEnterpriseUserDrawer({
  teamId,
  visible,
  projectUsers,
  teamUsers,
  onClose: handleClose,
  onComplete: handleComplete,
  refreshProjectUsers,
}: AddEnterpriseUserDrawerProps) {
  const [
    { selectedRowKeys, selectedUser, createUnits, addUserId },
    updateState,
  ] = useImmer<AddUserDrawerState>({
    selectedRowKeys: [],
    selectedUser: undefined,
    createUnits: [],
    addUserId: undefined,
  });
  const { onUserNotFound } = useContext(ProjectPageContext);
  const { specialties } = useRecoilValue(projectPageState);
  const [form] = useForm();
  const close = () => {
    handleClose();
    form.resetFields();
    updateState((draft) => {
      draft.selectedRowKeys = [];
      draft.selectedUser = undefined;
      draft.createUnits = [];
    });
  };
  const onClose = (complete?: boolean) => {
    if (!complete && selectedUser?.userId) {
      Modal.confirm({
        title: "取消提示",
        content: "是否放弃新增成员?",
        onOk() {
          close();
        },
      });
      return;
    }
    close();
  };

  const onComplete = () => {
    message.success("添加成功");
    handleComplete();
    onClose(true);
  };
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const { currentUser, teams } = useRecoilValue(projectPageState);
  // useEffect(() => {
  //   if (visible) {
  //     userService
  //       .listUsersByPhonePrefix(currentUser?.telephone?.substr(0, 3) ?? "138")
  //       .then(setUsers);
  //   }
  // }, [visible]);

  const onSelectChange = (keys: (string | number)[]) => {
    updateState((draft) => {
      draft.selectedRowKeys = keys;
    });
  };
  const onSelect = (team: Team, selected: Boolean) => {
    updateState((draft) => {
      draft.createUnits = selected
        ? [
            ...createUnits,
            { teamId: team.id!, specialtyId: specialties[0]?.id ?? "" },
          ]
        : createUnits.filter((unit) => unit.teamId !== team.id);
    });
  };
  const onSelectAll = (selected: Boolean) => {
    updateState((draft) => {
      draft.createUnits = selected
        ? teams.map((team) => ({
            teamId: team.id!,
            specialtyId: specialties[0]?.id ?? "",
          }))
        : [];
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelect,
    onSelectAll,
  };
  const dropdownDiv = useRef<HTMLDivElement>(null);
  const username = selectedUser?.name || "-";
  const columns = [
    {
      title: "团队",
      dataIndex: "name",
    },
    {
      title: "创建工作单元",
      dataIndex: "name",
      width: 260,
      render: (value: string, row: Team) =>
        selectedRowKeys.includes(row.id!) ? (
          <>
            <Checkbox
              checked={createUnits.some((unit) => unit.teamId === row.id!)}
              onChange={(e) => {
                updateState((draft) => {
                  draft.createUnits = e.target.checked
                    ? [
                        ...createUnits,
                        {
                          teamId: row.id!,
                          specialtyId: specialties[0]?.id ?? "",
                        },
                      ]
                    : createUnits.filter((unit) => unit.teamId !== row.id);
                });
              }}
            >
              同时创建 {username} 的工作单元
            </Checkbox>
            {createUnits.some((unit) => unit.teamId === row.id!) && (
              <div style={{ width: "100%", marginTop: 4 }}>
                <span>专业：</span>
                <Select
                  size="small"
                  style={{ width: 100 }}
                  value={
                    createUnits.find((unit) => unit.teamId === row.id)
                      ?.specialtyId
                  }
                  onChange={(id) => {
                    updateState((draft) => {
                      const a = draft.createUnits.find(
                        (unit) => unit.teamId === row.id,
                      );
                      if (a) a.specialtyId = id;
                    });
                  }}
                >
                  {specialties?.map((specialty) => (
                    <Select.Option key={specialty.id!} value={specialty.id!}>
                      {specialty.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </>
        ) : null,
    },
  ];

  const onSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (values.userId) {
        let { userId } = values;
        if (currentUser?.isPersonalAccount) {
          const newUserInfo = await userService.userinfoById(userId);
          userId = newUserInfo?.id || 1;
        }
        if (teamId) {
          await teamService.addUserToTeam(userId, teamId);
          if (values.createWorkUnit) {
            await workUnitService.createNewWorkUnit(
              `${username}的工作单元`,
              teamId,
              values.specialtyId ?? "",
              "workunit",
              "",
              userId,
            );
            publishEvent(`createWorkUnit`, ["项目配置", `协同设置`], {
              eventLevel: "P1",
              from: "为团队添加成员页",
            });
          }
          onComplete();
        } else {
          try {
            await projectService.addUserToProject(userId, projectId);
            let publishedEventFlag = false;
            const promiseList = selectedRowKeys.map(async (joinedTeamId) => {
              const createUnit = createUnits.find(
                (x) => x.teamId === joinedTeamId.toString(),
              );
              if (createUnit && !publishedEventFlag) {
                publishedEventFlag = true;
                publishEvent(`createWorkUnit`, ["项目配置", `协同设置`], {
                  eventLevel: "P1",
                  from: "为项目添加成员页",
                });
              }
              await teamService.addUserToTeam(userId, joinedTeamId.toString());

              if (createUnit) {
                await workUnitService.createNewWorkUnit(
                  `${username}的工作单元`,
                  joinedTeamId.toString(),
                  createUnit.specialtyId,
                  "workunit",
                  "",
                  userId,
                );
              }
            });
            onUserNotFound("");
            onComplete();
          } catch (error) {
            form.setFields([
              { name: "userId", errors: [error.response?.data?.msg] },
            ]);
          }
        }
        publishEvent(`addUser`, ["项目配置", `协同设置`], {
          eventLevel: "P1",
          from: teamId ? "团队管理页" : "项目成员页",
        });
      }
    } catch (err) {
      onResponseError(err);
    }
  };

  return (
    <Drawer
      maskClosable={false}
      destroyOnClose
      title="添加成员"
      visible={visible}
      onClose={() => onClose()}
      width={480}
      // footer={
      //   <Space style={{ float: "right" }}>
      //     <Button onClick={() => onClose()}>取消</Button>
      //     <Button
      //       type="primary"
      //       onClick={onSubmit}
      //     >
      //       保存
      //     </Button>
      //   </Space>
      // }
      {...defaultDrawerSettings}
    >
      <Form
        style={{ marginBottom: 16 }}
        form={form}
        labelAlign="left"
        initialValues={{ createWorkUnit: true }}
        onFinish={onSubmit}
      >
        <Form.Item
          labelCol={{ span: 6 }}
          label="账号"
          style={{ marginBottom: 32 }}
          name="userId"
          rules={
            currentUser?.isPersonalAccount
              ? [
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: "请输入合法手机号",
                  },
                  { required: true, message: "请输入合法手机号" },
                ]
              : [{ required: true, message: "请选择成员" }]
          }
        >
          {currentUser?.isPersonalAccount ? (
            <Input placeholder="请输入想邀请用户的手机号码" />
          ) : teamId ? (
            <EnterpriseUserSelect
              users={teamUsers}
              disabledText="已在团队中"
              currentUsers={projectUsers}
              onUserChange={(user) =>
                updateState((draft) => {
                  draft.selectedUser = user;
                  draft.selectedRowKeys = [];
                })
              }
            />
          ) : (
            <EnterpriseUserSelect
              disabledText="已在项目中"
              users={projectUsers}
              onUserChange={(user) =>
                updateState((draft) => {
                  draft.selectedUser = user;
                  draft.selectedRowKeys = [];
                })
              }
            />
          )}
        </Form.Item>
        {selectedUser?.userId && (
          <Row style={{ marginBottom: 32 }}>
            <Col
              span={teamId ? 24 : 12}
              key="name"
              style={{ marginBottom: 16 }}
            >
              <Form.Item label="成员姓名">{selectedUser.name ?? "-"}</Form.Item>
            </Col>
            {/* <Col
                span={teamId ? 24 : 12}
                key="telephone"
                style={{ marginBottom: 16 }}
              >
                <Form.Item label="手机号码">{selectedUser.telephone}</Form.Item>
              </Col> */}
            <Col span={24} key="createNewWorkUnit">
              {teamId ? (
                <>
                  <Form.Item
                    name="createWorkUnit"
                    initialValue
                    valuePropName="checked"
                  >
                    <Checkbox>同时创建 {username} 的工作单元</Checkbox>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.createWorkUnit !== currentValues.createWorkUnit
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("createWorkUnit") ? (
                        <Form.Item
                          label="专业"
                          name="specialtyId"
                          rules={[{ required: true, message: "请选择专业" }]}
                        >
                          <Select>
                            <Select.Option key="" value={null as any}>
                              {" "}
                            </Select.Option>
                            {specialties?.map((specialty) => (
                              <Select.Option
                                key={specialty.id!}
                                value={specialty.id!}
                              >
                                {specialty.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </>
              ) : (
                <>
                  <div>选择团队:</div>
                  <Table
                    style={{ marginTop: 10 }}
                    rowSelection={rowSelection}
                    columns={columns}
                    rowKey="id"
                    dataSource={teams}
                    pagination={false}
                  />
                </>
              )}
            </Col>
          </Row>
        )}
        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" block>
            {currentUser?.isPersonalAccount ? "添加" : "保存"}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
