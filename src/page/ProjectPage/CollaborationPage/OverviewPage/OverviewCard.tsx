import React from "react";
import { Button } from "component/Antd";
import { Card } from "antd";
import { CardProps } from "antd/lib/card";

interface OverviewCardProps extends CardProps {
  otherActions?: React.ReactNode[];
  onShowAll?: () => void;
}
const OverviewCard: React.FC<OverviewCardProps> = (props) => {
  const { title, otherActions, children, onShowAll, ...rest } = props;
  return (
    <Card
      {...rest}
      bordered={false}
      className="overview-card"
      title={
        title && (
          <div className="overview-card-title">
            <span>{title}</span>
            <span>
              {otherActions}
              <Button size="small" onClick={() => onShowAll && onShowAll()}>
                查看全部
              </Button>
            </span>
          </div>
        )
      }
    >
      {children}
    </Card>
  );
};
export default OverviewCard;
