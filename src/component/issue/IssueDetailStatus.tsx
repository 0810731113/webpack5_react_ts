import React, { useEffect, ReactNode, FC } from "react";
import { Form, message, Modal, Space, Tooltip } from "antd";
import {
  Row,
  Descriptions,
  DescriptionsItem,
  Select,
  SelectOption,
  Button as AntButton,
  TextArea,
} from "component/Antd";
import { IssueVOEx } from "hook/use-issue-service.hook";
import { useImmer } from "use-immer";
import { issueService, authService } from "service";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import "./IssueView.scss";
import CheckPermissionPlatform from "component/CheckPermission/CheckPermissionPlatform";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { ButtonProps } from "antd/lib/button";
import { publishEvent } from "function/stats.func";
import { specialtyTypeName } from "AppPanel";
import { SpecialtyVOTypeEnum } from "api/generated/model";
import { IssueType, StatusEnum } from "./IssueList";

const FormItem = Form.Item;
interface IssueDetailStatusProps {
  issue: IssueVOEx;
  actions?: ReactNode;
  size?: SizeType;
  isPanel?: boolean;
  closeVersion?: number;
  noBlock?: boolean;
  onCommit: () => void;
  specialtyType?: SpecialtyVOTypeEnum;
}
interface IssueDetailStatusState {
  solveStatus?: string;
  showModal: boolean;
}
enum ButtonType {
  Finish = "finish",
  Close = "close",
  No = "no",
  Yes = "yes",
  Solve = "solve",
  Reopen = "reopen",
}
const Button: FC<ButtonProps> = (props) => (
  <CheckPermissionPlatform resouseType={ResourcePermissionResourceEnum.Issue}>
    <TooltipWrapper
      when={(tooltipWrapperProps) => tooltipWrapperProps.disabled ?? false}
      title="处于示例项目中无该功能权限"
    >
      <AntButton {...props} />
    </TooltipWrapper>
  </CheckPermissionPlatform>
);
const IssueDetailStatus = (props: IssueDetailStatusProps) => {
  const {
    issue,
    actions,
    size,
    isPanel,
    closeVersion,
    onCommit,
    noBlock,
    specialtyType,
  } = props;
  const [{ solveStatus, showModal }, update] = useImmer<IssueDetailStatusState>(
    {
      showModal: false,
      solveStatus: undefined,
    },
  );
  const [form] = Form.useForm();
  useEffect(() => {
    update((draft) => {
      draft.solveStatus = issue?.status;
    });
  }, [issue]);
  const currentUnit =
    (issue &&
      issue.issueDatasets &&
      issue.issueDatasets.find((unit) => unit.isCurrent)) ||
    {};
  const onSaveClick = async () => {
    const { memo } = form.getFieldsValue();
    if (solveStatus === ButtonType.Close && !memo) {
      message.error("请填写备注");
      return;
    }
    const body = {
      issueId: issue.id,
      memo,
      userId: authService.getUserId()!,
      closeUserId: authService.getUserId()!,
      closeVersion,
    };
    const result =
      solveStatus === ButtonType.Yes
        ? await issueService.solveIssue(body)
        : await issueService.closeIssue(body);
    message.success(
      // `问题${issue.type === IssueType.team ? "WT" : "PZ"}-${
      //   issue.sequenceNo
      // }#${solveStatus}，该消息已为您推送至 ${issue.teamName}-${
      //   issue.userName
      // } `,
      "问题状态已更新",
    );
    update((draft) => {
      draft.showModal = false;
    });
    if (result) {
      onCommit?.();
    }
  };
  const onClick = async (type: ButtonType) => {
    const body = {
      issueId: issue.id,
      userId: authService.getUserId()!,
    };
    switch (type) {
      case ButtonType.Finish:
        await issueService.finishIssue(body);
        publishEvent(`finishIssue`, ["团队协同", "问题管理"], {
          eventLevel: "P2",
          from: noBlock ? "问题列表" : "轻量化查看页",
        });
        break;
      case ButtonType.No:
        await issueService.reopenIssue(body);
        break;
      case ButtonType.Reopen:
        if (!isPanel) {
          publishEvent(`reopenIssue`, ["团队协同", "问题管理"], {
            eventLevel: "P3",
          });
        }
        await issueService.reopenIssue(body);
        break;
      case ButtonType.Solve:
        await issueService.dealIssue(body);
        if (isPanel && specialtyType) {
          publishEvent("solveIssue", ["工具"], {
            from: specialtyTypeName[specialtyType],
          });
        }
        break;
      case ButtonType.Close:
        update((draft) => {
          draft.solveStatus = type;
          draft.showModal = true;
        });
        publishEvent(`closeIssue`, ["团队协同", "问题管理"], {
          eventLevel: "P2",
          from: noBlock ? "问题列表" : "轻量化查看页",
        });
        return;
      case ButtonType.Yes:
        update((draft) => {
          draft.solveStatus = type;
          draft.showModal = true;
        });
        return;
      default:
        return;
    }
    message.success("问题状态已更新");
    onCommit?.();
  };
  return (
    <div
      className={["issue-status-actions", !noBlock ? "block" : ""].join(" ")}
    >
      {isPanel && (
        <>
          {issue.status === StatusEnum.Open && (
            <Button size={size} onClick={() => onClick(ButtonType.Solve)}>
              解决问题
            </Button>
          )}
          {issue.status === StatusEnum.WaitingForSubmission && (
            <Button size={size} onClick={() => onClick(ButtonType.Reopen)}>
              回到打开中
            </Button>
          )}
          {issue.status === StatusEnum.WaitingForVerification && (
            <span style={{ color: "red" }}>
              *已提交至广联达协同设计平台，请等待验证结果
            </span>
          )}
        </>
      )}
      {((issue.status === StatusEnum.Open && !isPanel) ||
        issue.status === StatusEnum.WaitingForSubmission) && (
        <Tooltip
          title={
            (currentUnit.version || 0) >= (closeVersion || 0)
              ? "工作单元未提交新版本，按钮不可用"
              : ""
          }
        >
          <div
            className={`button-wrap ${
              (currentUnit.version || 0) >= (closeVersion || 0) && "show-tip"
            }`}
          >
            <Button
              size={size}
              onClick={() => onClick(ButtonType.Finish)}
              disabled={(currentUnit.version || 0) >= (closeVersion || 0)}
            >
              已完成处理
            </Button>
          </div>
        </Tooltip>
      )}
      {issue.status === StatusEnum.Open && !isPanel && (
        <Button size={size} onClick={() => onClick(ButtonType.Close)}>
          关闭问题
        </Button>
      )}
      {issue.status === StatusEnum.WaitingForVerification && !isPanel && (
        <>
          <Button size={size} onClick={() => onClick(ButtonType.No)}>
            不通过
          </Button>
          <Button size={size} onClick={() => onClick(ButtonType.Yes)}>
            验证通过
          </Button>
        </>
      )}
      {[StatusEnum.Close, StatusEnum.Solve].includes(
        issue.status! as StatusEnum,
      ) &&
        !isPanel && (
          <Button size={size} onClick={() => onClick(ButtonType.Reopen)}>
            重新打开
          </Button>
        )}
      {actions}
      <Modal
        onOk={onSaveClick}
        onCancel={() => {
          update((draft) => {
            draft.showModal = false;
          });
        }}
        visible={showModal}
        title={solveStatus === ButtonType.Yes ? "验证通过" : "关闭问题"}
      >
        <Form size={size} form={form} className="issue-memo-textarea">
          <FormItem
            labelAlign="left"
            label={solveStatus === "已关闭" ? "关闭理由" : "解决理由"}
            required={solveStatus === "已关闭"}
            name="memo"
          >
            <TextArea />
          </FormItem>
        </Form>
      </Modal>
      {/* <Descriptions>
        <DescriptionsItem label="问题状态" className="status-item">
          <Select
            size={size}
            style={{ flex: "auto" }}
            value={solveStatus}
            disabled={issue.status !== "解决中"}
            onChange={(value) => {
              update((draft) => {
                draft.solveStatus = value;
              });
            }}
          >
            {["解决中", "已解决", "已关闭"].map((status) => (
              <SelectOption key={status} value={status}>
                {status}
              </SelectOption>
            ))}
          </Select>
          {actions}
        </DescriptionsItem>
      </Descriptions>
      {issue.status === "解决中" && solveStatus !== "解决中" && (
        <Form
          size={size}
          form={form}
          className="issue-memo-textarea"
          style={{ width: 520 }}
        >
          <FormItem
            labelAlign="left"
            label={solveStatus === "已关闭" ? "关闭理由" : "解决理由"}
            required={solveStatus === "已关闭"}
            name="memo"
          >
            <TextArea />
          </FormItem>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button size={size}
              type="primary"
              style={{ width: 113 }}
              ghost
              onClick={onSaveClick}
            >
              保存
            </Button>
          </div>
        </Form>
      )} */}
    </div>
  );
};
export default IssueDetailStatus;
