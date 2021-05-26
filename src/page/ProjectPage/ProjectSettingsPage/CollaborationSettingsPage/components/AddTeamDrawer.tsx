import { Button, Checkbox, Drawer, Form, Input, message, Select } from "antd";
import { Team } from "api/generated/model";
import { TextArea } from "component/Antd";
import Loading from "component/Loading";
import { defaultDrawerSettings } from "consts";
import { publishEvent } from "function/stats.func";
import { ProjectParams } from "model/route-params.model";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { useContext, useEffect } from "react";
import { useRouteMatch } from "react-router";
import { useRecoilValue } from "recoil";
import { teamService, workUnitService } from "service";
import projectPageState from "state/project.state";
import { useImmer } from "use-immer";

export interface AddTeamDrawerProps {
  teamId?: string | null;
  editMode?: boolean;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface FormValues {
  name: string;
  description: string;
  createWorkUnit: boolean;
  specialtyId?: string;
}

export interface State {
  loading: boolean;
  team: Team | null;
  formValues: FormValues | null;
}

export default function AddTeamDrawer(props: AddTeamDrawerProps) {
  const { teamId, visible, editMode, onClose, onComplete } = props;
  const [{ team, loading }, updateState] = useImmer<State>({
    team: null,
    loading: !!editMode,
    formValues: {} as any,
  });
  const { currentUser, specialties } = useRecoilValue(projectPageState);
  const { onResponseError } = useContext(ProjectPageContext);
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  function setState(currentTeam: Team | null, currentLoading: boolean) {
    updateState((draft) => {
      draft.team = currentTeam;
      draft.loading = currentLoading;
    });
  }

  useEffect(() => {
    if (editMode && teamId && visible) {
      teamService.getTeamInfo(teamId).then((currentTeam) => {
        setState(currentTeam!, false);
      });
    }

    return () => {
      setState(null, false);
    };
  }, [editMode, teamId, visible]);

  const initialValue =
    editMode && team
      ? {
          name: team.name,
          description: team.description,
        }
      : { createWorkUnit: true };
  const title = editMode ? "编辑团队" : "创建团队";

  function createTeam({
    name,
    description,
    createWorkUnit,
    specialtyId,
  }: FormValues) {
    teamService
      .createTeam(name, description, projectId)
      .then((currentTeam) => {
        publishEvent(`createTeam`, ["项目配置", `协同设置`], {
          eventLevel: "P1",
        });
        if (currentTeam && createWorkUnit) {
          publishEvent(`createWorkUnit`, ["项目配置", `协同设置`], {
            eventLevel: "P1",
            from: "创建团队的快捷方式",
          });
          return workUnitService.createNewWorkUnit(
            `${currentUser!.name}的工作单元`,
            currentTeam.id!,
            specialtyId ?? "",
            "workunit",
          );
        }
      })
      .then(onComplete)
      .then(() => message.success("团队已创建"))
      .catch(onResponseError);
  }

  function updateTeam({ name, description }: FormValues) {
    teamService
      .updateTeam(teamId!, name, description)
      .then(onComplete)
      .then(() => message.success("团队信息修改成功"))
      .catch(onResponseError);
  }

  return (
    <Drawer
      visible={visible}
      title={title}
      width={480}
      onClose={onClose}
      {...defaultDrawerSettings}
    >
      {!!editMode && loading && <Loading />}
      {(!editMode || (!!editMode && !loading && !!team)) && (
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          initialValues={initialValue}
          onFinish={(values) => {
            console.log(values);
            if (editMode) {
              updateTeam(values as FormValues);
            } else {
              createTeam(values as FormValues);
            }
          }}
        >
          <Form.Item
            label="团队名"
            name="name"
            rules={[{ required: true, message: "请填写团队名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="团队描述" name="description">
            <TextArea rows={5} allowClear maxLength={200} />
          </Form.Item>

          {!editMode && (
            <>
              <Form.Item
                name="createWorkUnit"
                wrapperCol={{ span: 24 }}
                valuePropName="checked"
              >
                <Checkbox>
                  同时创建 {currentUser?.name ?? "XXX"} 的工作单元
                </Checkbox>
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

              <Form.Item>
                <p>您将自动被加入到这个团队。</p>
              </Form.Item>
            </>
          )}
          <Form.Item wrapperCol={{ span: 24 }}>
            <Button type="primary" htmlType="submit" block>
              提交
            </Button>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
