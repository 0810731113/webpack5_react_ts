import React, {
  useEffect,
  useContext,
  forwardRef,
  MutableRefObject,
  ForwardRefRenderFunction,
} from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Form, Input, Button, Checkbox, FormInstance } from "antd";
import { applyService } from "service";
import UploadImage from "page/ProjectPage/ProjectSettingsPage/ProjectInfoSettingsPage/UploadImg";
import { onResponseError } from "function/auth.func";
import { ApplyPageContext } from "./ApplyPage";

interface RegisterProps {
  individual?: boolean;
}

interface State {}

const Register: ForwardRefRenderFunction<FormInstance<any>, RegisterProps> = (
  props: RegisterProps,
  ref: any | null,
  // ref: MutableRefObject<FormInstance<any> | undefined> | null,
) => {
  const { individual } = props;
  const { applyingAccount, isNew, setSucceed } = useContext(ApplyPageContext);
  const [formRef] = Form.useForm();
  if (ref) {
    ref.current = formRef;
  }
  return (
    <>
      <Form
        form={formRef}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        name="basic"
        initialValues={applyingAccount!}
        validateTrigger="onBlur"
        onFinish={(values) => {
          // console.log("Success:", values);
          const { passwordMobile, identity, password } = applyingAccount!;
          applyService
            .submitApply(isNew, {
              ...values,
              passwordMobile,
              identity,
              password,
            })
            .then(() => {
              setSucceed();
            })
            .catch(onResponseError);
        }}
        onFinishFailed={(errorInfo) => {
          console.log("Failed:", errorInfo);
        }}
      >
        <Form.Item
          label="您的姓名"
          name="userName"
          rules={[{ required: true, message: "请输入姓名" }]}
        >
          <Input size="large" placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          label="电子邮箱"
          name="passwordEmail"
          rules={[
            { type: "email", message: "邮箱格式不正确" },
            { required: true, message: "请输入电子邮箱" },
          ]}
        >
          <Input
            size="large"
            placeholder={`请输入您的${individual ? "" : "企业"}邮箱`}
          />
        </Form.Item>

        <Form.Item
          label="QQ号码"
          name="qq"
          rules={[
            { required: true, message: "请输入QQ号码" },
            {
              pattern: /^[1-9]\d{4,14}/,
              message: "QQ号格式不正确",
            },
          ]}
        >
          <Input size="large" placeholder="请输入您的QQ号码" />
        </Form.Item>

        {!individual && (
          <>
            <Form.Item label="微信号" name="weChat">
              <Input size="large" placeholder="请输入微信号" />
            </Form.Item>
          </>
        )}
        <Form.Item
          label="所属公司"
          name="company"
          // rules={[
          //   { type:'email', message: "不是正确的邮箱" },
          //   { required: true, message: "请输入验证码" }
          // ]}
        >
          <Input size="large" placeholder="请输入公司全称" />
        </Form.Item>

        <Form.Item
          label="所在部门"
          name="department"
          // rules={[
          //   { type:'email', message: "不是正确的邮箱" },
          //   { required: true, message: "请输入验证码" }
          // ]}
        >
          <Input size="large" placeholder="请输入您所在的部门" />
        </Form.Item>

        <Form.Item
          label="担任职位"
          name="position"
          // rules={[
          //   { type:'email', message: "不是正确的邮箱" },
          //   { required: true, message: "请输入验证码" }
          // ]}
        >
          <Input size="large" placeholder="请输入您担任的职位" />
        </Form.Item>

        <Form.Item
          label="任职凭证"
          name="certificate"
          extra={
            <>
              <div>例如营业执照、工牌等，只支持.jpg和.png格式，不大于5M</div>
            </>
          }
          // rules={[
          //   { type:'email', message: "不是正确的邮箱" },
          //   { required: true, message: "请输入验证码" }
          // ]}
        >
          <UploadImage onChange={(url) => console.log(url)} />
        </Form.Item>

        <Form.Item
          label="申请理由"
          name="reason"
          // rules={[{ required: true, message: "请输入申请理由" }]}
        >
          <Input.TextArea
            placeholder="请输入您的申请理由，200字以内"
            maxLength={200}
          />
        </Form.Item>

        {!individual && (
          <Form.Item wrapperCol={{ span: 24 }}>
            <Button type="primary" htmlType="submit">
              提交申请
            </Button>
          </Form.Item>
        )}
      </Form>
    </>
  );
};

export default forwardRef<FormInstance, RegisterProps>(Register);
