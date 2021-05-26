import React, {
  useEffect,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { Switch, Route } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useImmer } from "use-immer";
import {
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Modal,
  FormInstance,
} from "antd";
import { applyService } from "service";
import { onResponseError } from "function/auth.func";
import { MobileBindAccount } from "api-auth/generated/model";
import consts from "consts";
import { IsPC } from "function/common.func";
import { AxiosError } from "axios";
import { ApplyPageContext } from "./ApplyPage";

const { ENV } = consts;

interface VerifyTelProps {
  onNext?: () => void;
}

interface State {
  second: number;
}
const VerifyTel: ForwardRefRenderFunction<FormInstance<any>, VerifyTelProps> = (
  props: VerifyTelProps,
  ref: any | null,
) => {
  const { onNext } = props;
  const [{ second }, updateState] = useImmer<State>({ second: 0 });
  const { replace } = useHistory();

  const [form] = Form.useForm();
  if (ref) {
    ref.current = form;
  }
  useEffect(() => {
    if (second > 0) {
      setTimeout(() => {
        updateState((draft) => {
          draft.second -= 1;
        });
      }, 1000);
    }
  }, [second]);
  const { setAccounts, setApplyingAccountInfo } = useContext(ApplyPageContext);

  const sendSMS = async () => {
    const values = await form.validateFields(["mobile"]);
    try {
      if (onNext) {
        await applyService.sendSMS(values.mobile);
      } else {
        await applyService.getCode(values.mobile);
      }
      message.success("验证码已发送");
      updateState((draft) => {
        draft.second = 60;
      });
    } catch (error) {
      if (!onNext && error.response?.data.code === 50015) {
        Modal.confirm({
          icon: <ExclamationCircleFilled />,
          centered: true,
          title: "温馨提醒",
          content: `该手机号已申请过广联达数字设计试用资格，是否立即前往协同设计平台?`,
          okText: `立即前往`,
          onOk() {
            window.location.href = "/";
          },
        });
      } else {
        onResponseError(error);
      }
    }
  };

  const goNext = (
    accounts: MobileBindAccount[] | undefined,
    mobile: string,
  ) => {
    if (accounts instanceof Array && accounts.length > 0) {
      setAccounts(accounts.filter((acc) => acc?.status === -1));
    }
    setApplyingAccountInfo("passwordMobile", mobile);
    onNext?.();
  };

  const onSubmit = (mobile: string, code: string) => {
    applyService
      .getMainAccountList(mobile, code)
      .then((mobileAccounts) => {
        const appliedNames = mobileAccounts
          ?.filter((acc) => acc.status! >= 0)
          .map((acc) => acc.username ?? "");

        const unAppliedAccounts = mobileAccounts?.filter(
          (acc) => acc.status! >= -1,
        );

        if (appliedNames && appliedNames.length > 0) {
          // 测试专用代码
          if (ENV === "qa") {
            Modal.confirm({
              title: `温馨提示`,
              content: `该手机号已申请过试用资格，账号名为 ${appliedNames.join(
                ",",
              )}`,
              okText: "前往登录",
              cancelText: "继续（QA测试专用）",
              onOk() {
                replace("/enterprise");
              },
              onCancel() {
                goNext(unAppliedAccounts, mobile);
              },
            });
          } else {
            Modal.info({
              title: `温馨提示`,
              content: `该手机号已申请过试用资格，账号名为 ${appliedNames.join(
                ",",
              )}`,
              okText: IsPC() ? "前往登录" : "确定",
              onOk() {
                if (IsPC()) {
                  replace("/enterprise");
                }
              },
            });
          }
        } else {
          goNext(unAppliedAccounts, mobile);
        }
      })
      .catch(onResponseError);
  };

  return (
    <>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        labelAlign="left"
        name="basic"
        form={form}
        validateTrigger="onBlur"
        onFinish={(values) => {
          // console.log("Success:", values);
          onSubmit(values.mobile, values.code);
        }}
        onFinishFailed={(errorInfo) => {
          console.log("Failed:", errorInfo);
        }}
      >
        <Form.Item
          label="手机号码"
          name="mobile"
          rules={[
            {
              pattern: /^1[3-9]\d{9}$/,
              message: "无效的手机号码",
            },
            { required: true, message: "请输入手机号码" },
          ]}
        >
          <Input size="large" placeholder="请输入手机号码" />
        </Form.Item>

        <Form.Item
          label="验证码"
          name="code"
          rules={[{ required: true, message: "请输入验证码" }]}
        >
          <Input
            size="large"
            suffix={
              <Button type="link" disabled={second > 0} onClick={sendSMS}>
                {second > 0 ? `${second}s` : "获取验证码"}
              </Button>
            }
            placeholder="请输入验证码"
          />
        </Form.Item>

        <div className="commit-wrap">
          <Form.Item
            // wrapperCol={{ span: 16 }}
            name="remember"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  // eslint-disable-next-line prefer-promise-reject-errors
                  value
                    ? Promise.resolve()
                    : // eslint-disable-next-line prefer-promise-reject-errors
                      Promise.reject("请阅读并同意协议"),
              },
            ]}
          >
            <Checkbox>
              <span style={{ marginRight: 2 }}>我已阅读并同意</span>
              <a
                href="https://account.glodon.com/agreement"
                target="_blank"
                rel="noreferrer"
              >
                广联达用户协议
              </a>
              <span style={{ margin: "0 2px" }}>和</span>
              <a
                href="https://account.glodon.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                隐私政策
              </a>
            </Checkbox>
          </Form.Item>

          {onNext && (
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
            </Form.Item>
          )}
        </div>
      </Form>
    </>
  );
};
export default forwardRef<FormInstance, VerifyTelProps>(VerifyTel);
