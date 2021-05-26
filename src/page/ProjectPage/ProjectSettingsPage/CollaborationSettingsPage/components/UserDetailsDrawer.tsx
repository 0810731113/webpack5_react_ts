import { Drawer } from "antd";
import { User } from "api/generated/model";
import { Descriptions, DescriptionsItem } from "component/Antd";
import React, { useEffect } from "react";
import { userService } from "service";
import { useImmer } from "use-immer";
import { defaultDrawerSettings } from "consts";

export interface Props {
  userId: string;
  visible: boolean;
  onClose: () => void;
}

export interface State {
  user: User | null;
}

export default function (props: Props) {
  const { userId, visible, onClose } = props;
  const [{ user }, updateState] = useImmer<State>({ user: null });

  useEffect(() => {
    userService.getUser(userId).then((user) => {
      updateState((draft) => {
        draft.user = user ?? null;
      });
    });
  }, [userId]);

  if (!user) {
    return null;
  }

  return (
    <Drawer
      title="成员详情"
      visible={visible}
      onClose={onClose}
      width={480}
      {...defaultDrawerSettings}
    >
      <Descriptions>
        <DescriptionsItem label="成员姓名">{user.name}</DescriptionsItem>
        <DescriptionsItem label="手机号码">{user.telephone}</DescriptionsItem>
      </Descriptions>
    </Drawer>
  );
}
