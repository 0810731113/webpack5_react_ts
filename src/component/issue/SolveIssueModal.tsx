import React from "react";
import { Modal, message, Form } from "antd";
import { issueService, authService } from "service";
import { ModalProps } from "antd/lib/modal";
import { TextArea } from "component/Antd";
import { NumberParam, withDefault, useQueryParams } from "use-query-params";

const FormItem = Form.Item;
export enum SolveIssueModalTypeEnum {
  Solve = "solve",
  Close = "close",
  False = "",
}
const types = {
  [SolveIssueModalTypeEnum.Solve]: {
    status: "已解决",
    btnLabel: "已解决",
    required: false,
    commitFun: issueService.solveIssue,
  },
  [SolveIssueModalTypeEnum.Close]: {
    status: "已关闭",
    btnLabel: "关闭问题",
    required: true,
    commitFun: issueService.closeIssue,
  },
};

interface SolveIssueModalProps extends ModalProps {
  solveType: SolveIssueModalTypeEnum;
}
const SolveIssueModal = (props: SolveIssueModalProps) => {
  const { solveType, onOk, ...rest } = props;
  const currentType = (solveType && types[solveType]) || undefined;
  const [form] = Form.useForm();
  const [{ activeIssueId }] = useQueryParams({
    activeIssueId: withDefault(NumberParam, undefined),
  });
  const onCommit = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { memo } = form.getFieldsValue();
    if (currentType?.required && !memo) {
      message.error("请填写备注");
      return;
    }
    const body = {
      issueId: activeIssueId,
      memo,
      userId: authService.getUserId()!,
    };
    const result =
      solveType === SolveIssueModalTypeEnum.Solve
        ? await issueService.solveIssue(body)
        : await issueService.closeIssue(body);
    if (result) {
      onOk && onOk(e);
    }
  };
  return (
    <Modal {...rest} onOk={onCommit} width={418}>
      <span>将此问题状态标为: {currentType?.status}</span>
      <Form form={form} className="issue-memo-textarea">
        <FormItem label="备注" required={currentType?.required} name="memo">
          <TextArea />
        </FormItem>
      </Form>
      {/* <div className='form-group issue-memo-textarea' style={{margin: '16px 0 0', height: 140, width: 370}}>
            <GTextArea label={`备注 (${currentType?.required ? '必填' : '选填'})`} value={memo} onChange={(e) => {
                const value = e.target.value;
                update(draft => {draft.memo = value})
            }} />
        </div> */}
    </Modal>
  );
};
export default SolveIssueModal;
