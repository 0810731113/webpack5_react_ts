import React, { useEffect, useState } from "react";
import { List, Button, Tree, Tag } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { DataSetEx } from "service/package.service";
import {
  useWorkUnitListByTeamId,
  useVersionListByWorkUnits,
} from "hook/use-work-unit-service.hook";
import Loading from "component/Loading";

interface ContentListViewerProps {
  teamId: string;
  addContent: (item: DataSetEx) => void;
  contents: DataSetEx[];
}
function ContentListViewer(props: ContentListViewerProps) {
  const { teamId, addContent, contents = [] } = props;
  const { workUnits: committedWorkUnits, loading } = useWorkUnitListByTeamId(
    teamId,
    "committed",
  );
  const {
    versions: allVersions,
    loading: loadingVersions,
  } = useVersionListByWorkUnits(committedWorkUnits, "committed");
  return (
    <div className="sider content-list-viewer">
      {loading || loadingVersions ? (
        <Loading absolute />
      ) : (
        <List
          className="work-unit-list"
          split={false}
          dataSource={committedWorkUnits.map((unit) => {
            const versions = allVersions.filter(
              (version) => version.dataSetId === unit.id,
            );
            return {
              ...unit,
              versions,
              selectedVersion: versions && versions[0],
            };
          })}
          header={
            <div
              className="work-unit-list-header"
              style={{ marginTop: teamId && -12 }}
            >
              待选列表
            </div>
          }
          renderItem={(item) => (
              <List.Item>
                {item.name}
                <span>
                  <Button
                    type="link"
                    onClick={() => addContent && addContent(item)}
                    disabled={contents.some(
                      (content) => content.id === item.id,
                    )}
                    icon={<PlusCircleOutlined />}
                  />
                </span>
              </List.Item>
            )}
        />
      )}
    </div>
  );
}

export default ContentListViewer;
