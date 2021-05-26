import React, { Fragment, useEffect, useState } from "react";
import { List as AList, Empty } from "antd";
import {
  ListItemProps as AListItemProps,
  ListProps as Props,
} from "antd/lib/list";
import RcQueueAnim from "rc-queue-anim";
import Loading from "component/Loading";
import Scrollbars from "react-custom-scrollbars";
import { defaultScrollbarSettings } from "consts";
import "./style.scss";
import Scrollbar from "component/Scrollbar/Scrollbar";

interface ListItemProps extends AListItemProps {}
interface ListProps extends Props<any> {}

function ListItemWrap(node: React.ReactNode) {
  const NewNode: React.FC<{ key: string }> = (props) => {
    const { key, ...rest } = props;
    return <Fragment key={key}>{node}</Fragment>;
  };
  return NewNode;
}

export function ListItem(props: ListItemProps) {
  return <AList.Item {...props} />;
}
export default function List(props: ListProps) {
  const {
    dataSource,
    children,
    renderItem,
    loading,
    className,
    ...rest
  } = props;
  const [delay, setDelay] = useState<number>(0);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    const length = (dataSource?.length ?? -1) + 1;
    setTimeout(() => {
      setLoaded(false);
      setDelay(length * 100 + (length ? 450 : 0));
    }, delay || 100);
  }, [dataSource]);
  useEffect(() => {
    setLoaded(true);
  }, [loading]);
  return (
    <AList
      {...rest}
      loading={loading}
      className={[className, "gdc-list"].join(" ")}
    >
      <Scrollbar
        renderThumbHorizontal={() => <div />}
        renderTrackHorizontal={() => <div />}
      >
        {!loading &&
          (!children && (!dataSource || dataSource?.length === 0) ? (
            <Empty />
          ) : (
            <RcQueueAnim
              component="ul"
              delay={[loaded ? 0 : delay, 0]}
              componentProps={{ className: "ant-list-items" }}
            >
              {children ||
                dataSource?.map((item, index) => {
                  const node = renderItem && renderItem(item, index);
                  const Wrap = ListItemWrap(node);
                  return renderItem ? (
                    <Wrap key={item.id ?? index} />
                  ) : (
                    <ListItem key={item.id ?? index}>{item}</ListItem>
                  );
                })}
            </RcQueueAnim>
          ))}
      </Scrollbar>
    </AList>
  );
}
