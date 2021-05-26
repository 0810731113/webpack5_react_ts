import React, { useEffect, useState, useRef } from "react";

import { Table, Button, Select, SelectOption } from "component/Antd";
import { MinusCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { getStatus, ConvertStatus } from "function/version.func";
import { DataSetEx } from "service/package.service";
import { Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";

interface ContentsListProps {
  shareContent: DataSetEx[];
  onRemoveContent: (dataSet: DataSetEx) => void;
  editable: boolean;
  onChangeVersion: (dataSet: DataSetEx, val: number) => void;
  action?: React.ReactNode;
}

function ContentsList(props: ContentsListProps) {
  const {
    shareContent,
    onRemoveContent,
    editable,
    onChangeVersion,
    action,
  } = props;
  const [{ project }] = useRecoilState(projectPageState);
  const columns = [
    {
      title: "选择的内容",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      render: (text: string, record: DataSetEx) =>
        editable ? (
          <Select
            className="version-select"
            bordered={false}
            value={record.selectedVersion?.id}
            onChange={(versionId: number) =>
              onChangeVersion && onChangeVersion(record, versionId)
            }
          >
            {record.versions
              ?.filter((version) => getStatus(version) !== ConvertStatus.nodata)
              .map((version, i) => (
                <SelectOption key={version.id} value={version.id!}>
                  {version.displayVersion}
                </SelectOption>
              ))}
          </Select>
        ) : (
          record.selectedVersion?.displayVersion
        ),
    },
    {
      title: "",
      dataIndex: "review",
      key: "review",
      render: (text: string, record: DataSetEx) => (
        <Link
          to={`/model-viewer?versionIdList=${record?.selectedVersion?.id}&format=${record.type}&title=“${project?.name}”模型查看`}
          target="_blank"
        >
          <Button
            type="link"
            disabled={
              !record.selectedVersion ||
              getStatus(record.selectedVersion) === ConvertStatus.nodata
            }
            icon={<EyeOutlined />}
          />
        </Link>
      ),
    },
    {
      title: "",
      dataIndex: "delete",
      key: "delete",
      render: (text: string, record: DataSetEx) =>
        editable && (
          <Button
            type="link"
            danger
            onClick={() => onRemoveContent && onRemoveContent(record)}
            icon={<MinusCircleOutlined style={{ fontSize: 14 }} />}
          />
        ),
    },
  ];
  return (
    <div className="contents-list">
      <Table dataSource={shareContent} pagination={false} columns={columns} />
      <span className="action">{action}</span>
    </div>
  );
}

export default ContentsList;
