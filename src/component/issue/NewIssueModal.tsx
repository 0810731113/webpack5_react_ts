import { ArrowLeftOutlined } from "@ant-design/icons";
import { Drawer, Form, message, Checkbox, Tooltip } from "antd";
import { DrawerProps } from "antd/lib/drawer";
import { TreeNode } from "api/generated/model";
import { Button, Input, Select, SelectOption, TextArea } from "component/Antd";
import Iconfont from "component/Iconfont";
import { publishEvent } from "function/stats.func";
import { useIssueImg } from "hook/use-issue-service.hook";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import consts from "consts";
import CheckPermissionPlatform from "component/CheckPermission/CheckPermissionPlatform";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";

const FormItem = Form.Item;
interface NewIssueModalState {
  useAutoPic: boolean;
  isAuto: boolean;
}
const NewIssueModal = (
  props: DrawerProps & {
    element?: any;
    croppedDataURL?: string;
    isPanel?: boolean;
    workUnits?: TreeNode[];
    fromNewButton?: boolean;
    onScreenshot: () => void;
    onCommit: (data: {
      title: string;
      description?: string;
      workUnitId: string;
      croppedDataURL?: string | null;
    }) => void;
  },
) => {
  const { ENV } = consts;
  const {
    onCommit,
    workUnits,
    element,
    visible,
    onClose,
    onScreenshot,
    croppedDataURL,
    isPanel,
    fromNewButton,
    ...rest
  } = props;
  const [{ useAutoPic, isAuto }, updateState] = useImmer<NewIssueModalState>({
    useAutoPic: !isPanel,
    isAuto: true,
  });
  const { issueImg: imgUrl } = useIssueImg(croppedDataURL);
  const [form] = Form.useForm();
  const reset = () => {
    form.resetFields();
    updateState((draft) => {
      draft.useAutoPic = true;
      draft.isAuto = true;
    });
  };
  const commit = () => {
    form.validateFields().then((values) => {
      const { title, description, workUnitId } = values;
      if (!title) {
        message.error("请填写问题标题");
        return;
      }
      if (!workUnitId) {
        message.error("请选择指定给哪个工作单元");
        return;
      }
      onCommit?.({
        title,
        description,
        workUnitId,
        croppedDataURL: useAutoPic ? null : croppedDataURL,
      });
      reset();
      if (!isPanel) {
        publishEvent(`newIssue`, ["团队协同", "问题管理"], {
          eventLevel: "P1",
          from: fromNewButton ? "新建问题按钮" : "选中构件后右键",
        });
      }
    });
  };

  useEffect(() => {
    form.setFieldsValue({ workUnitId: element?.unitId });
  }, [element]);
  useEffect(() => {
    updateState((draft) => {
      draft.useAutoPic = !croppedDataURL;
    });
  }, [croppedDataURL]);
  return (
    <Drawer
      {...rest}
      width={isPanel ? "100%" : 320}
      destroyOnClose
      onClose={(e) => {
        reset();
        onClose?.(e);
      }}
      closeIcon={
        <a>
          <ArrowLeftOutlined />
          返回
        </a>
      }
      visible={visible}
      className={["issue-detail-mini-drawer", isPanel ? "isPanel" : ""].join(
        " ",
      )}
      mask={false}
      getContainer={false}
      style={{ position: "absolute" }}
    >
      <Form form={form}>
        <FormItem
          label="问题构件"
          required
          rules={[{ required: true, message: "请选择问题构件" }]}
        >
          {element?.elementName || (
            <span style={{ color: "rgba(0, 0, 0, 0.25)" }}>请在模型中点选</span>
          )}
        </FormItem>
        <FormItem
          label="问题名称"
          required
          name="title"
          rules={[
            { required: true, message: "请输入问题名称" },
            { max: 50, message: "问题名称字数不能超过50个" },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem label="问题描述" name="description">
          <TextArea />
        </FormItem>
        <FormItem
          required
          label="指定给"
          name="workUnitId"
          initialValue={element?.unitId}
          rules={[{ required: true, message: "请选择指定给哪个工作单元" }]}
        >
          <Select disabled={!!element?.elementName}>
            {workUnits?.map((unit) => (
              <SelectOption key={unit.id} value={unit.id!}>
                {unit.name}
              </SelectOption>
            ))}
          </Select>
        </FormItem>
        <FormItem label="问题快照" required>
          <Tooltip title="快照" placement="bottom">
            <Button
              style={{ float: "right" }}
              icon={<Iconfont type="icon-wentiguanli-shengchengkuaizhao" />}
              type="link"
              onClick={() => {
                updateState((draft) => {
                  draft.isAuto = false;
                });
                onScreenshot?.();
              }}
            />
          </Tooltip>
        </FormItem>
      </Form>
      {/* {(!useAutoPic || isPanel) && ( */}
      <img
        src={imgUrl ?? ""}
        alt=""
        style={{ maxWidth: "100%", margin: `8px 0` }}
      />
      {/* )} */}
      {/* {!isPanel && (
        <Checkbox
          onChange={(e) =>
            updateState((draft) => {
              draft.useAutoPic = e.target.checked;
            })
          }
          checked={useAutoPic}
        >
          自动生成快照
        </Checkbox>
      )} */}
      <CheckPermissionPlatform
        resouseType={ResourcePermissionResourceEnum.Issue}
      >
        <TooltipWrapper
          wrapStyle={{ width: "100%" }}
          when={(tooltipWrapperProps) => tooltipWrapperProps.disabled ?? false}
          title="处于示例项目中无该功能权限"
        >
          <Button
            type="primary"
            style={{ marginTop: 10 }}
            block
            onClick={commit}
          >
            创建
          </Button>
        </TooltipWrapper>
      </CheckPermissionPlatform>
    </Drawer>
  );
};
export default NewIssueModal;
