import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { Project, ProjectStatusEnum, ProjectVO } from "api/generated/model";
import {
  Modal,
  Space,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  message,
} from "antd";
import { extractDataFromStandardObj } from "function/standard.func";
import { projectService } from "service";
import { publishEvent } from "function/stats.func";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import {
  ViewType,
  ViewTypeParam,
} from "page/ProjectPage/WorkspacePage/WorkspacePage";
import { useQueryParam } from "use-query-params";
import { fetchAdressData } from "./SelectAddress";
import InfoProjectForm from "./InfoProjectForm";

interface ProjectActionModalProps {
  type: "new" | "edit";
  onOK?: (info: Project) => Promise<void>;
  projectId: string;

  visible: boolean;
  onClose: () => void;
}

interface State {
  info: ProjectVO;
  isLoading: boolean;
  simpleMode: boolean;
  violationFields: Array<string>;
}

const defaultFormValue = {
  name: "",
  status: ProjectStatusEnum.Ongoing,
  thumbnail: "",
  province: undefined,
  county: undefined,
  city: undefined,
  street: undefined,
  detail: "",
  designEnterprise: "",
  buildingEnterprise: "",
  structureType: "",
  buildingType: "",
  description: "",
};

export default function ProjectActionModal(props: ProjectActionModalProps) {
  const { visible, onClose, type, onOK, projectId, ...rest } = props;
  const [
    { info, isLoading, simpleMode, violationFields },
    updateState,
  ] = useImmer<State>({
    isLoading: false,
    info: defaultFormValue,
    simpleMode: type === "new",
    violationFields: [],
  });
  const [viewType, setViewType] = useQueryParam("viewType", ViewTypeParam);
  const [{ currentUser }] = useRecoilState(projectPageState);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      updateState((draft) => {
        draft.simpleMode = type === "new";
        draft.isLoading = false;
        draft.violationFields = [];
      });

      (async () => {
        let _info: any = defaultFormValue;
        if (projectId) {
          const pjData = await projectService.loadProjectById(projectId);
          _info = {
            ...pjData,
            ...fetchAdressData(pjData!),
            ...extractDataFromStandardObj(
              [
                "buildingType",
                "structureType",
                "buildingEnterprise",
                "designEnterprise",
              ],
              pjData?.standardProperties ?? [],
            ),
          };
        }

        form.setFieldsValue(_info);

        updateState((draft) => {
          draft.info = _info;
        });
      })();
    }
  }, [visible]);

  const setViolation = (vfields: string[]) => {
    updateState((draft) => {
      draft.violationFields = vfields;
    });
  };

  const callApi = async () => {
    const values = await form.validateFields();
    updateState((draft) => {
      draft.isLoading = true;
    });

    try {
      await onOK?.({
        ...info,
        ...values,
      });
      publishEvent(
        projectId ? "editProject" : `createProject`,
        projectId
          ? ["项目配置", "项目信息"]
          : [
              "工作台",
              `${currentUser?.isPersonalAccount ? "个人" : "企业"}账号工作台`,
            ],
        {
          eventLevel: "P1",
          from: projectId
            ? undefined
            : `${viewType === ViewType.Manage ? "企业" : "个人"}工作台`,
        },
      );
    } catch (err) {
      if (err?.response?.data?.code === 54001) {
        const vFields = err?.response?.data?.data ?? [];
        setViolation(vFields);
        if (vFields.includes("name")) {
          form.setFields([
            {
              name: "name",
              errors: ["包含违规内容"],
            },
          ]);
        }

        message.warning("包含违规内容，请修改后再操作");
      } else {
        message.error(err?.message);
      }
    } finally {
      updateState((draft) => {
        draft.isLoading = false;
      });
    }
  };

  if (visible) {
    if (simpleMode) {
      return (
        <Modal
          {...rest}
          destroyOnClose
          onCancel={onClose}
          visible={visible}
          title="创建项目"
          width={480}
          maskClosable={false}
          footer={
            <Space>
              <Button
                onClick={() => {
                  updateState((draft) => {
                    draft.simpleMode = false;
                  });
                }}
              >
                继续完善资料
              </Button>
              <Button type="primary" onClick={callApi} loading={isLoading}>
                立即创建
              </Button>
            </Space>
          }
        >
          <div className="form-group" style={{ margin: 0, width: "100%" }}>
            <Form form={form}>
              <Form.Item
                label="项目名称"
                name="name"
                rules={[
                  { required: true, message: "请输入项目名称!" },
                  // { whitespace: true, message: "请输入项目名称!" },
                ]}
              >
                <Input
                  allowClear
                  placeholder="请输入项目名称"
                  maxLength={45}
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "name",
                        value: e.target.value.trim(),
                        errors: [],
                      },
                    ]);
                    form?.validateFields(["name"]);
                  }}
                />
              </Form.Item>
              <Form.Item label="项目状态" name="status">
                <Select>
                  <Select.Option value={ProjectStatusEnum.Ongoing}>
                    进行中
                  </Select.Option>
                  <Select.Option value={ProjectStatusEnum.Suspended}>
                    暂停中
                  </Select.Option>
                  <Select.Option value={ProjectStatusEnum.Completed}>
                    已完成
                  </Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      );
    }

    return (
      <Drawer
        {...rest}
        destroyOnClose
        onClose={() => {
          onClose();
          updateState((draft) => {
            draft.simpleMode = true;
          });
        }}
        title={type === "new" ? "创建项目" : "编辑项目信息"}
        width="100%"
        visible={visible}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button
              onClick={() => {
                onClose();
                updateState((draft) => {
                  draft.simpleMode = true;
                });
              }}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" onClick={callApi} loading={isLoading}>
              {type === "new" ? "创建" : "更新"}
            </Button>
          </div>
        }
      >
        <InfoProjectForm
          info={info}
          type={type}
          form={form}
          violationFields={violationFields}
          setViolation={setViolation}
        />
      </Drawer>
    );
  }
  return null;
}
