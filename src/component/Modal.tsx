import { Modal as AModal } from "antd";
import { ModalProps } from "antd/lib/modal";
import { ModalStaticFunctions } from "antd/lib/modal/confirm";
import React from "react";

const OriginModal: React.FC<ModalProps> = (props) => <AModal {...props} />;

// declare type Modal = typeof OriginModal & ModalStaticFunctions & {
//     destroyAll: () => void;
// };
// declare const Modal: Modal;
export default OriginModal;
