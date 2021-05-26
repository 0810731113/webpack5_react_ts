import React, { useEffect, useState, useRef } from "react";

import { Modal } from "component/Antd";
import { packageService, authService } from "service";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { publishEvent } from "function/stats.func";
import { StringParam, useQueryParams, withDefault } from "use-query-params";
import BaseInfoForm from "./BaseInfoForm";

interface PackageModalProps {
  onClose: (tag: boolean) => void;
  onCommit: (packagesId: string[]) => void;
  showPackageModal: boolean;
  shareId: string;
}
const defaultName = `提资- ${new Date().toLocaleDateString()}`;

function PackageModal(props: PackageModalProps) {
  const { onClose, onCommit, showPackageModal, shareId } = props;
  const [{ showPackageModal: showPackageModalQuery }] = useQueryParams({
    showPackageModal: withDefault(StringParam, undefined),
  });
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [{ teams }] = useRecoilState(projectPageState);
  async function createShare() {
    const result = await packageService.createPackage(
      {
        consumedIds: teams
          .filter((team) => team.id !== shareId && team.id)
          .map((team) => team.id ?? ""),
        description,
        name,
        shareId,
      },
      authService.getUserId()!,
    );
    if (result?.data) {
      onCommit(result.data?.map((item) => item.id ?? "").filter(Boolean));
    }
    publishEvent(`createPackages`, ["团队协同", "提收资"], {
      eventLevel: "P1",
      from: showPackageModalQuery === "overview" ? "团队协同页" : "提资记录页",
    });
  }
  useEffect(() => {
    if (!showPackageModal) {
      setName(defaultName);
      setDescription("");
    }
  }, [showPackageModal]);

  return (
    <Modal
      title="创建资料包"
      width={480}
      visible={showPackageModal}
      okText="创建"
      cancelText="取消"
      onOk={createShare}
      onCancel={() => onClose(false)}
    >
      <BaseInfoForm
        info={{ name, description }}
        onChangeInfo={(info) => {
          setName(info.name);
          setDescription(info.description);
        }}
      />
    </Modal>
  );
}

export default PackageModal;
