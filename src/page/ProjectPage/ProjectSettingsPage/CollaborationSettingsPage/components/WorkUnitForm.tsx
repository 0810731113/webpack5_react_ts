import { Button, Form, Input, message, Select } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";
import { DataSetVO, UserVO } from "api/generated/model";
import Loading from "component/Loading";
import { first } from "lodash";
import { ProjectParams } from "model/route-params.model";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { useContext, useEffect } from "react";
import { useRouteMatch } from "react-router";
import { useRecoilValue } from "recoil";
import { teamService, workUnitService } from "service";
import projectPageState from "state/project.state";
import { useImmer } from "use-immer";

export interface WorkUnitFormProps {
  teamId?: string | null;
  editMode?: boolean;
  workUnitId?: string;
  onClose: () => void;
  onComplete: () => void;
}

export interface State {
  workUnit: DataSetVO | null;
  loading?: boolean;
  users: UserVO[];
  selectedTeamId: string | undefined;
}

export default function WorkUnitForm(props: WorkUnitFormProps) {
  const {} = props;

  const { teamId, workUnitId, editMode, onClose, onComplete } = props;
  const { teams, specialties } = useRecoilValue(projectPageState);
  const { onResponseError } = useContext(ProjectPageContext);
  const team = teams.find((_team) => _team.id === teamId);

  const [
    { workUnit, users: teamUsers, loading, selectedTeamId },
    updateState,
  ] = useImmer<State>({
    workUnit: null,
    users: [],
    selectedTeamId: teamId ?? first(teams)?.id,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [form] = Form.useForm();

  useEffect(() => {
    if (editMode && workUnitId) {
      updateState((draft) => {
        draft.loading = true;
      });
      workUnitService.loadWorkUnitById(workUnitId).then((_workUnit) => {
        updateState((draft) => {
          draft.workUnit = _workUnit!;
          draft.loading = false;
        });
      });
    }
  }, [editMode, workUnitId]);

  useEffect(() => {
    if (selectedTeamId) {
      teamService.getUsersInTeams(selectedTeamId).then((users) => {
        updateState((draft) => {
          draft.users = users ?? [];
        });
      });
    }
  }, [selectedTeamId]);

  if (loading && editMode) {
    return <Loading />;
  }

  const initialValue =
    editMode && workUnit
      ? {
          name: workUnit.name,
          teamId: workUnit.teamId,
          specialtyId: workUnit.specialtyId,
          ownerId: workUnit.ownerId,
          description: workUnit.description,
        }
      : {};

  const candidates = selectedTeamId ? teamUsers : [];
  return (
    <div>
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={initialValue}
        onFinish={({
          name,
          teamId: _selectedTeamId,
          specialtyId,
          ownerId,
          description,
        }) => {
          if (!editMode) {
            workUnitService
              .createNoDefaultOwnerWorkUnit(
                name,
                _selectedTeamId ?? teamId,
                specialtyId,
                "workunit",
                description,
                ownerId,
              )
              .then(() => {
                message.success("工作单元创建成功");
                onComplete();
                onClose();
              })
              .catch(onResponseError);
          } else {
            workUnitService
              .updateWorkUnit(workUnitId!, {
                name,
                teamId: _selectedTeamId ?? teamId,
                specialtyId,
                type: "workunit",
                description,
                ownerId,
              })
              .then(() => {
                message.success("工作单元更新成功");
                onComplete();
                onClose();
              })
              .catch(onResponseError);
          }
        }}
      >
        <Form.Item
          label="单元名称"
          name="name"
          rules={[{ required: true, message: "请填写单元名称" }]}
        >
          <Input />
        </Form.Item>
        {team && (
          <Form.Item label="团队" name="teamId">
            {team.name}
          </Form.Item>
        )}
        {!team && (
          <Form.Item
            label="团队"
            name="teamId"
            // initialValue={first(teams)?.id}
            rules={[{ required: true, message: "请选择团队" }]}
          >
            <Select
              onChange={(_teamId) => {
                form.setFields([{ name: "ownerId", value: null }]);
                updateState((draft) => {
                  draft.selectedTeamId = _teamId as string;
                });
              }}
            >
              {teams.map((teamIndex) => (
                <Select.Option key={teamIndex.id!} value={teamIndex.id!}>
                  {teamIndex.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          label="专业"
          name="specialtyId"
          rules={[{ required: true, message: "请选择专业" }]}
        >
          <Select>
            {specialties?.map((specialty) => (
              <Select.Option key={specialty.id!} value={specialty.id!}>
                {specialty.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="负责人"
          name="ownerId"
          extra={
            <div style={{ marginTop: 6, fontSize: 12 }}>
              <ExclamationCircleFilled
                style={{ color: "#faad14", marginRight: 5 }}
              />
              只有负责人可使用工具软件打开此工作单元
            </div>
          }
        >
          <Select>
            <Select.Option value={"" as any}> </Select.Option>
            {candidates.map((user) => (
              <Select.Option key={user.id!} value={user.id!}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="单元描述" name="description">
          <TextArea rows={5} allowClear maxLength={200} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" block>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
