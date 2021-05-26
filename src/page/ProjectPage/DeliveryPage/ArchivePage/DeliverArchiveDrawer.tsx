import { Drawer, Input, Button, Table, message, Form, Select } from "antd";
import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { defaultDrawerSettings } from "consts";
import {
  archiveService,
  userService,
  projectService,
  enterpriseService,
} from "service";
import {
  UserVO,
  AssignmentArchiveVO,
  AssignmentArchiveVOStatusEnum,
} from "api/generated/model";
import { ColumnType } from "antd/lib/table";
import { useForm } from "antd/lib/form/Form";
import { useRecoilValue } from "recoil";
import projectPageState from "state/project.state";
import { defaultDateTimeFromString } from "function/date.func";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { EnterpriseMember } from "api/generated/model";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import useRecipience from "hook/use-recipience.hook";
import { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import SearchPhone,{fetchUserList} from './components/SearchPhone';

const { Option, OptGroup } = Select;

interface DeliverArchiveDrawerProps {
  archiveId: string;
  visible: boolean;
  onClose: () => void;
}

interface State {
  name: string;
  projectUsers: EnterpriseMember[];
  
}

interface SearchProps {
  key?: any;
  value?: any
}

export default function DeliverArchiveDrawer(props: DeliverArchiveDrawerProps) {
  const { archiveId, visible, onClose } = props;
  const [{ name, projectUsers }, updateState] = useImmer<State>({
    name: "",
    projectUsers: [],
  });
  const { currentUser, teams } = useRecoilValue(projectPageState);
  const [searchValue, setSearchValue] = React.useState<SearchProps>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [form] = useForm();

  const { recipiences, userNames, run,userPhones } = useRecipience(archiveId, projectId);

  useEffect(() => {
    if (visible) {
      archiveService.getArchiveByPackageId(archiveId).then((pkg) => {
        updateState((draft) => {
          draft.name = pkg?.name ?? "";
        });
      });

      if (currentUser?.isPersonalAccount === false) {
        enterpriseService.getSubAccountsWithMain().then((users) => {
          updateState((draft) => {
            draft.projectUsers = users;
          });
        });
      }
      run();
    }
  }, [visible]);

  const deliver = async () => {
    const values = await form.validateFields();
    console.log(`searchValue`);
    console.log(searchValue);
    try {
      let userId = values.recipientInfo;
      if (currentUser?.isPersonalAccount) {
        userId = searchValue?.value || '';
        const newUserInfo = await userService.userinfoById(
            userId,
        );
        userId = newUserInfo?.id || 1;
      }
      await archiveService.deliveryToRecipient(archiveId, userId, projectId);
      form.resetFields();
      run();
    } catch (error) {
      form.setFields([
        { name: "recipientInfo", errors: [error.response?.data?.msg] },
      ]);
    }
  };

  const columns: ColumnType<AssignmentArchiveVO>[] = [
    {
      title: "接收人",
      dataIndex: "recipient",
      render(value, record) {
        return userNames[value];
      },
    },
    {
      title: "交付时间",
      dataIndex: "createTime",
      render(value, item) {
        return defaultDateTimeFromString(value);
      },
    },
    {
      title: "交付人",
      dataIndex: "sharer",
      render(value, record) {
        return userNames[value];
      },
    },
    {
      title: "操作",
      dataIndex: "status",
      render(value, record) {
        // console.log(`value-record`)
        // console.log(value);
        // console.log(record);
        if (value === AssignmentArchiveVOStatusEnum.Enable) {
          return (
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ArchivePackage}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="link"
                  className="color-danger"
                  onClick={() => {
                    archiveService
                      .disableAssign(archiveId, projectId, record.recipient!)
                      .then(() => {
                        message.warning(
                          `${userNames[record.recipient!]}的权限已停用`,
                        );
                        run();
                      });
                  }}
                >
                  停用
                </Button>
              </TooltipWrapper>
            </CheckPermission>
          );
        }

        if (value === AssignmentArchiveVOStatusEnum.Disabled) {
          return (
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ArchivePackage}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="link"
                  onClick={() => {
                    archiveService
                      .enableAssign(archiveId, projectId, record.recipient!)
                      .then(() => {
                        message.warning(
                          `${userNames[record.recipient!]}的权限已启用`,
                        );
                        run();
                      });
                  }}
                >
                  启用
                </Button>
              </TooltipWrapper>
            </CheckPermission>
          );
        }

        return "-";
      },
    },
  ];

  // const formOptions = () => {
  //   const recipientIds = recipiences.map((recipience) => recipience.recipient);

  //   const option1 = {
  //     value: ProjectRole.ProjectAdmin,
  //     label: RoleName[ProjectRole.ProjectAdmin],
  //     children: adminUsers
  //       .filter((user) => !recipientIds.includes(user.id))
  //       .map((user) => ({
  //         value: user.id,
  //         label: user.name,
  //       })),
  //   };
  //   const option2 = {
  //     value: ProjectRole.ProjectExternalUser,
  //     label: RoleName[ProjectRole.ProjectExternalUser],
  //     children: externalUsers
  //       .filter((user) => !recipientIds.includes(user.id))
  //       .map((user) => ({
  //         value: user.id,
  //         label: user.name,
  //       })),
  //   };

  //   return [option1, option2];
  // };

  // const changeSelValue = (value : any) => {
  //   console.log(`value`);
  //   console.log(value);
  // }

  // const changeFocus = (e : any) => {
  //   console.log(`changeFocus`);
  //   //console.log(e);
  //   setSearchValue({});
  // }
  
  const setEmptyValue = () => {
    setSearchValue({});
  }

  return (
    <Drawer
      title="交付名单"
      visible={visible}
      onClose={onClose}
      width={600}
      {...defaultDrawerSettings}
    >
      <div className="drawer-info">
        <div className="line">
          <dt>交付包名称：</dt>
          <dd>{name}</dd>
        </div>
        <div className="line">
          <dt>添加接收人：</dt>
          <dd>
            {/* <Cascader
              options={formOptions()}
              expandTrigger="hover"
              onChange={(_data) => {
                updateState((draft) => {
                  draft.selectedUserId = _data[1]?.toString();
                });
              }}
              placeholder="请选择"
            /> */}

            {/* <SelectRecipient selectedUserId={selectedUserId} /> */}
            
            {/*<SearchPhone />*/}
            <Form form={form} onFinish={deliver}>
              <Form.Item
                name="recipientInfo"
                rules={
                  currentUser?.isPersonalAccount
                    ? [
                        // {
                        //   pattern: /^1[3-9]\d{9}$/,
                        //   message: "请输入合法手机号",
                        // },
                        // { required: true, message: "请输入合法手机号" },
                      ]
                    : [{ required: true, message: "请选择成员" }]
                }
              >
                {currentUser?.isPersonalAccount ? (
                    <SearchPhone
                        // mode="multiple"
                        showSearch
                        value={searchValue}
                        // value={searchValue}
                        placeholder="请输入想邀请用户的手机号码"
                        fetchOptions={fetchUserList}
                        onChange={newValue  => {
                          // console.log(`newValue`);
                          // console.log(newValue);
                          setSearchValue(newValue);
                        }}
                        style={{ width: '100%' }}
                        data={recipiences}
                        phones = {userPhones}
                        // onSelect={changeSelValue}
                        // onFocus={changeFocus}
                        setEmptyValue={setEmptyValue}
                    />
                 
                ) : (
                  <Select style={{ width: 386 }} placeholder="请选择接收人" >
                    <OptGroup label="可选账号">
                      {projectUsers
                        .filter(
                          (mem) =>
                            !recipiences?.some(
                              (rps) => rps.recipient === mem.userId!,
                            ),
                        )
                        .map((mem) => (
                          <Option key={mem.userId} value={mem.userId!}>
                            {`${mem.name ?? ""}(${mem.userName})`}
                          </Option>
                        ))}
                    </OptGroup>
                    <OptGroup label="已在交付名单中">
                      {recipiences.map((rps) => {
                        const user = projectUsers.find(
                          (_user) => _user.userId === rps.recipient,
                        );

                        return (
                          <Option
                            key={rps.recipient}
                            value={rps.recipient!}
                            disabled
                          >
                            {`${user?.name ?? ""}(${user?.userName})`}
                            {rps.status ===
                              AssignmentArchiveVOStatusEnum.Disabled && (
                              <span style={{ float: "right" }}>交付停用中</span>
                            )}
                          </Option>
                        );
                      })}
                    </OptGroup>
                  </Select>
                )}
              </Form.Item>
            </Form>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ArchivePackage}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  style={{ marginLeft: 4 }}
                  disabled={currentUser?.isPersonalAccount && !searchValue?.value}
                >
                  添加
                </Button>
              </TooltipWrapper>
            </CheckPermission>
          </dd>
        </div>
        {/* <div className="line">
          <dt />
          <dd className="ex-link">
            <span>找不到接收人？前往</span>
            <Link to={`/projects/${projectId}/settings/collaboration/users`}>
              项目成员管理
            </Link>
            <span>添加项目管理员或外部成员</span>
          </dd>
        </div> */}
      </div>

      <Table columns={columns} dataSource={recipiences} pagination={false} />
    </Drawer>
  );
}