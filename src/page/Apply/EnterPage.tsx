import React, { FC } from "react";
import { Card, Typography, Button, Col, Row } from "antd";
import consts from "consts";
import "./ApplyPage.scss";
import { Link, useRouteMatch } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";

const { PUBLIC_URL } = consts;
const { Title, Paragraph } = Typography;
interface EnterPageProps {}
const enterData = [
  {
    icon: `${PUBLIC_URL}/individualAccount.png`,
    title: "个人账号",
    content: (
      <>
        适用于个人用户或小团队用户
        <br />
        快速上手广联达数字设计
      </>
    ),
    type: "individual",
  },
  {
    icon: `${PUBLIC_URL}/enterpriseAccount.png`,
    title: "企业账号",
    content: (
      <>
        适用于企业用户或大型团队
        <br />
        管理提效、设计提速
      </>
    ),
    type: "enterprise",
  },
];

const EnterPage: FC<EnterPageProps> = (prpos) => {
  const {
    path,
    url,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  return (
    <div className="apply-enter">
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={12} xxl={12}>
          {enterData.map((item) => (
            <Link to={`${path}${item.type}`} key={item.type}>
              <Card hoverable className="apply-enter-card">
                <img className="enter-icon" src={item.icon} alt="enterIcon" />
                <Title level={3}>{item.title}</Title>
                <Paragraph>{item.content}</Paragraph>
                <Button
                  shape="round"
                  type="primary"
                  ghost
                  className="enter-button"
                >
                  申请试用
                </Button>
              </Card>
            </Link>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default EnterPage;
