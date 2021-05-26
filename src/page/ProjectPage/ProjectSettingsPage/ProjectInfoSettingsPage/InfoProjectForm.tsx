import { Form, Row, Col, Tag, Input, Select, FormInstance } from "antd";
import { Project, ProjectStatusEnum, ProjectVO } from "api/generated/model";
import React, { useEffect } from "react";
import consts from "consts";
import { trim, remove } from "lodash";
import UploadImage from "./UploadImg";
import SelectAddress from "./SelectAddress";

interface InfoProjectFormProps {
  info: ProjectVO;
  onChangeInfo?: (newInfo: Project) => void;
  type: "new" | "edit" | "showinfo";
  form?: FormInstance;
  violationFields?: Array<string>;
  setViolation?: (violationFields: string[]) => void;
}

const { AUTH_BASE_URL, PUBLIC_URL, LOGOUT_URL } = consts;

const InfoProjectForm = (props: InfoProjectFormProps) => {
  const { info, form, type, violationFields, setViolation } = props;

  const removeFiledsFromViolation = (field: string) => {
    setViolation?.(violationFields?.filter((fd) => fd !== field) ?? []);
  };

  if (type === "showinfo") {
    return (
      <Row justify="center" className="project-form">
        <Col lg={24} xl={18} xxl={14}>
          <Form initialValues={info} layout="vertical">
            <div className="basic-info">
              <Form.Item label="项目封面" name="thumbnail">
                <div
                  className="corbusiser"
                  style={{
                    backgroundImage: `url(${
                      trim(info.thumbnail) ||
                      `${PUBLIC_URL}/assets/images/projectDefault.png`
                    })`,
                  }}
                />
              </Form.Item>

              <div className="right">
                {info.status === ProjectStatusEnum.Ongoing && (
                  <Tag color="blue">进行中</Tag>
                )}
                {info.status === ProjectStatusEnum.Completed && (
                  <Tag color="success">已完成</Tag>
                )}
                {info.status === ProjectStatusEnum.Suspended && (
                  <Tag>暂停中</Tag>
                )}
                <Form.Item label="项目名称" name="name">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="项目简介" name="description">
                  <Input.TextArea
                    readOnly
                    autoSize={{ minRows: 4 }}
                    style={{ paddingBottom: 0 }}
                  />
                </Form.Item>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="项目地址" name="projectLocation">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="建筑类型" name="buildingType">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="结构类型" name="structureType">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="建设单位" name="buildingEnterprise">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item label="设计单位" name="designEnterprise">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row> */}
          </Form>
        </Col>
      </Row>
    );
  }
  return (
    <Row justify="center" className="project-form">
      <Col lg={24} xl={18} xxl={14}>
        <Form
          initialValues={info}
          layout="vertical"
          form={form}
          onFieldsChange={(fields) => {
            if ((fields?.[0].name as any)?.[0] === "thumbnail") {
              removeFiledsFromViolation("thumbnail");
            }
          }}
        >
          <div className="basic-info">
            <Form.Item label="项目封面" name="thumbnail">
              <UploadImage
                isViolation={violationFields?.includes("thumbnail")}
              />
            </Form.Item>

            <div className="right">
              <Row gutter={[8, 16]}>
                <Col span={18}>
                  <Form.Item
                    label="项目名称"
                    name="name"
                    rules={[{ required: true, message: "请输入项目名称!" }]}
                  >
                    <Input
                      maxLength={45}
                      placeholder="请输入项目名称"
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
                </Col>
                <Col span={6}>
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
                </Col>
              </Row>

              <Form.Item
                label="项目简介"
                name="description"
                validateStatus={
                  violationFields?.includes("description") ? "error" : ""
                }
                help={violationFields?.includes("description") ? "包含违规内容" : ""}
              >
                <Input.TextArea
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  maxLength={200}
                  allowClear
                  placeholder="请输入项目简介"
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "description",
                        value: e.target.value.trim(),
                      },
                    ]);
                    removeFiledsFromViolation("description");
                  }}
                />
              </Form.Item>
            </div>
          </div>

          <SelectAddress
            form={form}
            defaultInfo={info}
            violationFields={violationFields}
            setViolation={setViolation}
          />

          {/* <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="建筑类型"
                name="buildingType"
                validateStatus={
                  violationFields?.includes("buildingType") ? "error" : ""
                }
                help={violationFields?.includes("buildingType") ? "包含违规内容" : ""}
              >
                <Input
                  maxLength={20}
                  placeholder="请输入建筑类型"
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "buildingType",
                        value: e.target.value.trim(),
                      },
                    ]);
                    removeFiledsFromViolation("buildingType");
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="结构类型"
                name="structureType"
                validateStatus={
                  violationFields?.includes("structureType") ? "error" : ""
                }
                help={violationFields?.includes("structureType") ? "包含违规内容" : ""}
              >
                <Input
                  maxLength={20}
                  placeholder="请输入结构类型"
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "structureType",
                        value: e.target.value.trim(),
                      },
                    ]);
                    removeFiledsFromViolation("structureType");
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="建设单位"
                name="buildingEnterprise"
                validateStatus={
                  violationFields?.includes("buildingEnterprise") ? "error" : ""
                }
                help={
                  violationFields?.includes("buildingEnterprise") ? "包含违规内容" : ""
                }
              >
                <Input
                  maxLength={45}
                  placeholder="请输入建设单位"
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "buildingEnterprise",
                        value: e.target.value.trim(),
                      },
                    ]);
                    removeFiledsFromViolation("buildingEnterprise");
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="设计单位"
                name="designEnterprise"
                validateStatus={
                  violationFields?.includes("designEnterprise") ? "error" : ""
                }
                help={
                  violationFields?.includes("designEnterprise") ? "包含违规内容" : ""
                }
              >
                <Input
                  maxLength={45}
                  placeholder="请输入设计单位"
                  onBlur={(e) => {
                    form?.setFields([
                      {
                        name: "designEnterprise",
                        value: e.target.value.trim(),
                      },
                    ]);
                    removeFiledsFromViolation("designEnterprise");
                  }}
                />
              </Form.Item>
            </Col>
          </Row> */}
        </Form>
      </Col>
    </Row>
  );
};
export default InfoProjectForm;
