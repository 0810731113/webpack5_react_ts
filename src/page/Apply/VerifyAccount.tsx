import React, { useEffect, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Form, Input, Button, Radio, Select, message } from "antd";
import { applyService } from "service";
import { onResponseError } from "function/auth.func";
import { ApplyPageContext } from "./ApplyPage";

interface VerifyAccountProps {
  onNext: () => void;
}

interface State {
  useNew: boolean;
}

export default function VerifyAccount(props: VerifyAccountProps) {
  const { onNext } = props;
  const [{ useNew }, updateState] = useImmer<State>({
    useNew: true,
  });

  const {
    accounts,
    applyingAccount,
    setIsNew,
    setApplyingAccountInfo,
  } = useContext(ApplyPageContext);

  useEffect(() => {
    updateState((draft) => {
      draft.useNew = !(accounts.length > 0);
    });
  }, [accounts]);

  const goNext = (isNew: boolean) => {
    setIsNew(isNew);
    onNext();
  };

  return (
    <>
      {accounts.length > 0 && (
        <div>
          <div style={{ marginBottom: 8 }}>
            检测到您已有广联云企业账号，是否使用现有账号？
          </div>
          <div style={{ marginBottom: 24 }}>
            <Radio.Group
              onChange={(e) => {
                updateState((draft) => {
                  draft.useNew = e.target.value;
                });
              }}
              value={useNew}
            >
              <Radio value={false}>使用现有账号</Radio>
              <Radio value>创建新账号</Radio>
            </Radio.Group>
          </div>
        </div>
      )}
      {useNew ? (
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          name="basic"
          labelAlign="left"
          initialValues={{ remember: true }}
          validateTrigger="onBlur"
          onFinish={(values) => {
            applyService
              .registerUserCenter(
                values.identity,
                values.password,
                applyingAccount?.passwordMobile ?? "",
              )
              .then(() => {
                setApplyingAccountInfo("identity", values.identity);
                setApplyingAccountInfo("password", values.password);
                goNext(true);
              })
              .catch(onResponseError);
          }}
          onFinishFailed={(errorInfo) => {
            console.log("Failed:", errorInfo);
          }}
        >
          <Form.Item
            label="账号名"
            name="identity"
            rules={[
              { required: true, message: "请输入账号" },
              {
                pattern: /^[A-Za-z\u4e00-\u9fa5][\w\u4e00-\u9fa5]{2,19}$/,
                message:
                  "3-20字符，需要以汉字或字母开头，由汉字、字母、数字或下划线组成",
              },
            ]}
          >
            <Input placeholder="请设置账号名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码设置"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
              {
                pattern: /^(?!\d+$)(?![A-Za-z]+$)(?!([^\d()A-Za-z]|[()\\])+$)([^\d()A-Za-z]|[()\\]|[A-Za-z]|\d){8,16}$/,
                message: "请输入8-16位密码，数字、字母和符号至少包含两种",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="请设置密码" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="二次确认"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请确认你的密码",
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject("两次密码输入不一致");
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Button type="primary" htmlType="submit">
              下一步
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          name="basic"
          labelAlign="left"
          initialValues={{ remember: true }}
          validateTrigger="onBlur"
          onFinish={(values) => {
            applyService
              .verifyUserPassword(values.username, values.password)
              .then((account) => {
                setApplyingAccountInfo("identity", values.username);
                setApplyingAccountInfo("password", values.password);
                setApplyingAccountInfo("passwordEmail", account?.email ?? "");
                setApplyingAccountInfo("userName", account?.nickname ?? "");
                setApplyingAccountInfo("qq", account?.qq ?? "");
                setApplyingAccountInfo("company", account?.company ?? "");
                goNext(false);
              })
              .catch(() => {
                message.error("密码错误");
              });
          }}
          onFinishFailed={(errorInfo) => {
            console.log("Failed:", errorInfo);
          }}
        >
          <Form.Item
            label="现有账号"
            name="username"
            initialValue={accounts[0]?.username}
            rules={[
              {
                required: true,
                message: "请确认你的账号",
              },
            ]}
          >
            <Select>
              {accounts?.map((account) => (
                <Select.Option
                  value={account.username ?? "error"}
                  key={account.id}
                >
                  {account.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="密码验证"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Button type="primary" htmlType="submit">
              下一步
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
}
