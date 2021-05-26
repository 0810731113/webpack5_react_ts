/* eslint-disable jsx-a11y/label-has-associated-control */
import { useRequest } from "@umijs/hooks";
import { Button, Checkbox, Col, Row, message } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import Modal, { ModalProps } from "antd/lib/modal/Modal";
import { EnterpriseMember } from "api-auth/generated/model";
import { Project, ProjectVO, User } from "api/generated/model";
import { orderBy } from "lodash";
import React, { FC, useEffect } from "react";
import { enterpriseService, projectService, roleService } from "service";
import { useImmer } from "use-immer";
import Scrollbar from "component/Scrollbar/Scrollbar";
import "./WorkspacePage.scss";
import { ProjectRole } from "service/role.service";
import consts from "consts";
import Loading from "component/Loading";
import { publishEvent } from "function/stats.func";

const { AUTH_BASE_URL } = consts;
interface SelectAdminModalState {
  indeterminate: boolean;
  checkAll: boolean;
  checkedList: string[];
  commitLoading: boolean;
  sortedMembers?: EnterpriseMember[];
}
interface SelectAdminModalProps extends ModalProps {
  project?: Project | ProjectVO;
}
const SelectAdminModal: FC<SelectAdminModalProps> = (props) => {
  const { project, onCancel, visible } = props;
  const [
    { indeterminate, checkAll, checkedList, commitLoading, sortedMembers },
    update,
  ] = useImmer<SelectAdminModalState>({
    indeterminate: false,
    checkAll: false,
    checkedList: [],
    commitLoading: false,
    sortedMembers: [],
  });
  useEffect(() => {
    update((draft) => {
      draft.indeterminate = false;
      draft.checkAll = false;
    });
  }, [visible]);
  const loader = () =>
    enterpriseService
      .getSubAccounts()
      .then((members) => orderBy(members, "creationTime").reverse());
  const { data: members, loading, run } = useRequest<EnterpriseMember[]>(
    loader,
    {
      manual: true,
    },
  );
  const adminloader = (projectId: string) =>
    roleService.getProjectUsersByRole(projectId, ProjectRole.ProjectAdmin);
  const { data: admins, loading: adminsLoading, run: loadAdmin } = useRequest<
    EnterpriseMember[]
  >(adminloader, {
    manual: true,
  });
  useEffect(() => {
    if (project?.id) {
      run();
      loadAdmin(project?.id);
      update((draft) => {
        draft.checkedList = [];
        draft.indeterminate = false;
      });
    }
  }, [project?.id]);
  useEffect(() => {
    update((draft) => {
      if (members && admins) {
        draft.sortedMembers = [
          ...members.filter((member) =>
            admins?.every((adminId) => adminId !== member.userId),
          ),
          ...members.filter((member) =>
            admins?.some((adminId) => adminId === member.userId),
          ),
        ];
      }
    });
  }, [members, admins]);

  const onChange = (list: CheckboxValueType[]) => {
    const newList = list
      .map((value) => value.toString())
      .filter((id) => !admins?.some((adminId) => adminId === id));
    update((draft) => {
      draft.checkedList = newList;
      draft.indeterminate =
        !!newList.length && list.length < (members?.length ?? 0);
      draft.checkAll = list.length === members?.length;
    });
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    update((draft) => {
      draft.checkedList = e.target.checked
        ? members
            ?.map((user) => user.userId!)
            .filter((id) => !admins?.some((adminId) => adminId === id)) || []
        : [];
      draft.indeterminate = false;
      draft.checkAll = e.target.checked;
    });
  };
  return (
    <Modal
      {...props}
      title="设置管理员"
      width={490}
      className="select-admin-modal"
      footer={
        <>
          <label className="label-info">
            没找到合适的账号？
            <a
              href={`${AUTH_BASE_URL}/web/userinfo`}
              target="_blank"
              rel="noreferrer"
            >
              <Button type="link">前往创建</Button>
            </a>
          </label>
          <span>
            <Button onClick={onCancel} loading={commitLoading}>
              取消
            </Button>
            <Button
              type="primary"
              loading={commitLoading}
              onClick={async (e) => {
                update((draft) => {
                  draft.commitLoading = true;
                });
                await projectService.addUserProjectWithRole(project?.id!, {
                  roleType: ProjectRole.ProjectAdmin as any,
                  members:
                    members?.filter((member) =>
                      checkedList.includes(member.userId!),
                    ) || [],
                });
                message.success("管理员设置成功");
                publishEvent(
                  `setProjectManager`,
                  ["工作台", `企业账号工作台`],
                  { eventLevel: "P3" },
                );
                update((draft) => {
                  draft.commitLoading = false;
                });
                onCancel?.(e);
              }}
            >
              确定
            </Button>
          </span>
        </>
      }
    >
      <label className="label-info">
        您正在为“{project?.name}”设置管理员：
      </label>
      <div className="user-box check-all-box">
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
        >
          选择全部
        </Checkbox>
      </div>
      <Scrollbar
        className="scroll-wrap user-box"
        renderThumbHorizontal={undefined}
      >
        {loading || adminsLoading ? (
          <Loading />
        ) : (
          <Checkbox.Group
            value={[
              ...checkedList,
              ...(admins?.map((a) => a.toString()) || []),
            ]}
            onChange={onChange}
            style={{ padding: "12px 15px" }}
          >
            <Row>
              {sortedMembers?.map((user) => (
                <Col key={user.userId} span={24}>
                  <Checkbox
                    value={user.userId}
                    disabled={admins?.some(
                      (adminId) => adminId === user.userId,
                    )}
                  >
                    {user.name} ({user.userName})
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}
      </Scrollbar>
    </Modal>
  );
};
export default SelectAdminModal;
