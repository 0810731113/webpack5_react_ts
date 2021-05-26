/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-array-index-key */
import { Divider, Input, Typography } from "antd";
import consts from "consts";
import Modal, { ModalProps } from "antd/lib/modal/Modal";
import React, { FC, useEffect } from "react";
import "./WorkspacePage.scss";
import QueueAnim from "rc-queue-anim";
import { Button } from "component/Antd";
import { publishEvent } from "function/stats.func";

const { PUBLIC_URL } = consts;

interface SupportAndServiceModalProps extends ModalProps {}

const QRCodes = [
  {
    icon: `${PUBLIC_URL}/assets/images/qq-group.jpg`,
    title: (
      <>
        广联达设计官方①群
        <br />
        <img
          style={{
            width: 14,
            height: 14,
            marginRight: 4,
          }}
          src={`${PUBLIC_URL}/assets/images/QQ.png`}
        />
        群号：780831998
      </>
    ),
  },
  {
    icon: `${PUBLIC_URL}/assets/images/weixin-group.jpg`,
    title: (
      <>
        广联达设计官方微信
        <br />
        <img
          style={{
            width: 14,
            height: 14,
            marginRight: 4,
          }}
          src={`${PUBLIC_URL}/assets/images/wechat.png`}
        />
        加群小助手
      </>
    ),
  },
  {
    icon: `${PUBLIC_URL}/assets/images/weixin-public.jpg`,
    title: "广联达设计公众号",
    info: "关注获取第一手资讯",
  },
];
const services = [
  {
    title: " - 广联达设计400咨询电话：",
    value: "4000-166-166",
    info: "先拨“6”，再拨“1”，咨询有关设计问题",
  },
  { title: " - 广联达设计客户服务热线：", value: "021-54582074" },
  { title: " - 广联达设计客户服务邮箱：", value: "design@glodon.com" },
];

const SupportAndServiceModal: FC<SupportAndServiceModalProps> = (props) => {
  useEffect(() => {
    if (props.visible) {
      publishEvent(`support`, ["基础"], { eventLevel: "P2" });
    }
  }, [props.visible]);
  return (
    <Modal
      {...props}
      title="支持与服务"
      className="support-service-modal"
      width={580}
      footer={false}
    >
      <h3 className="title">A. 加入运营群，获取产品支持</h3>
      <QueueAnim delay={300} className="codes">
        {QRCodes.map((code, index) => (
          <React.Fragment  key={index}>
            {code.info && (
              <Divider
                style={{ bottom: "-0.6em", height: "auto" }}
                type="vertical"
              />
            )}
            <div className="code" key={index}>
              <img src={code.icon} />
              <h4>{code.title}</h4>
              <span>{code.info}</span>
            </div>
          </React.Fragment>
        ))}
      </QueueAnim>
      <h3 className="title">B. 联系我们，获取产品服务</h3>
      <QueueAnim delay={300} className="services">
        {services.map((service, index) => (
          <React.Fragment key={index}>
            <div className="service">
              <label>{service.title}</label>
              <Input
                value={service.value}
                readOnly
                suffix={
                  <Typography.Paragraph
                    style={{ margin: 0 }}
                    copyable={{
                      icon: [
                        <Button type="link">复制</Button>,
                        <Button type="link">复制</Button>,
                      ],
                      text: service.value.split("-").join(""),
                    }}
                  />
                }
              />
              <span>{service.info}</span>
            </div>
          </React.Fragment>
        ))}
      </QueueAnim>
    </Modal>
  );
};
export default SupportAndServiceModal;
