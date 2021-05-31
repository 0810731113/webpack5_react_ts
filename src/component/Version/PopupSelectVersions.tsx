import { Table, Popover, Input, Typography } from "antd";
import { DataSetVO, VersionVO } from "api/generated/model";
import { clone, first, orderBy, size, runInContext } from "lodash";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { InfoCircleFilled } from "@ant-design/icons";
import { ColumnType } from "antd/lib/table";
import { defaultDateTimeFromString } from "function/date.func";
import Iconfont from "component/Iconfont";

interface PopupVersionsProps {
  versions: VersionVO[];
  onVersionSelected?: (version: VersionVO | null) => void;
  selectedVersion: VersionVO | null;
  operationRender?: (version: VersionVO) => React.ReactNode;
}

interface VersionsState {
  visible: boolean;
  // selectedVersion: VersionVO | null;
}

export function PopupSelectVersions(props: PopupVersionsProps) {
  const {
    versions,
    onVersionSelected,
    selectedVersion,
    operationRender,
  } = props;
  const [{ visible }, updateState] = useImmer<VersionsState>({
    visible: false,
  });

  const selectVersion = (version: VersionVO) => {
    onVersionSelected?.(version);
    // updateState((draft) => {
    //   draft.selectedVersion = version;
    // });
  };

  useEffect(() => {
    if (versions instanceof Array && versions.length > 0 && !selectedVersion) {
      selectVersion(versions[0]);
    }
  }, [versions]);

  if (size(versions) === 0) {
    return <span>无数据</span>;
  }

  const non0Versions = versions.filter((v) => v.version !== 0);
  if (size(non0Versions) === 0) {
    return <span style={{ marginLeft: 12 }}>-</span>;
  }

  const columns: ColumnType<VersionVO>[] = [
    {
      title: "版本",
      width: 100,
      dataIndex: "displayVersion",
      render(value, item) {
        return (
          <>
            {item?.status === "Published" ? (
              <Iconfont type="icon-tijiaozhituanduixietong" />
            ) : (
              <Iconfont type="icon-baocunzhigerensheji" />
            )}
            <span style={{ marginLeft: 4 }}>{value}</span>
          </>
        );
      },
    },

    {
      title: "日期",
      width: 175,
      dataIndex: "datetime",
      render(value, item) {
        return defaultDateTimeFromString(item.creationTime);
      },
    },
    {
      title: "注释",
      dataIndex: "description",
      ellipsis: true,
    },
  ];

  const content = (
    <div style={{ maxHeight: "40vh", overflow: "auto", width: "40vw" }}>
      <Table
        rowSelection={{
          // columnTitle: "-",
          type: "radio",
          selectedRowKeys: selectedVersion ? [selectedVersion?.id!] : [],
          onChange(selectedRowKeys, selectedRows) {
            selectVersion(selectedRows[0]);
            updateState((draft) => {
              draft.visible = false;
            });
          },
        }}
        pagination={{ pageSize: 200, hideOnSinglePage: true }}
        columns={columns}
        dataSource={non0Versions.map((ver) => ({
          ...ver,
          key: ver.id!,
        }))}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      visible={visible}
      onVisibleChange={(v) =>
        updateState((draft) => {
          draft.visible = v;
        })
      }
    >
      <div
        style={{
          border: "1px solid rgba(0, 0, 0, 0.15)",
          // fontSize: 14,
          lineHeight: 1.5,
          padding: "0 4px",
          display: "inline-block",
          minWidth: 64,
        }}
      >
        {selectedVersion?.status === "Published" ? (
          <Iconfont type="icon-tijiaozhituanduixietong" />
        ) : (
          <Iconfont type="icon-baocunzhigerensheji" />
        )}
        <span style={{ marginLeft: 4 }}>{selectedVersion?.displayVersion}</span>
      </div>
    </Popover>
  );
}
