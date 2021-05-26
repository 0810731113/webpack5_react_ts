import React, { useEffect, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button } from "component/Antd";

import { findSpaceNodeById , SpaceSearchResult } from "function/space.func";

import { SpaceTreeNode } from "service/space-settings.service";
import BaseSpaceForm from "./BaseSpaceForm";
import SpaceSettingPageContext from "./SpaceSettingPageContext";
import LevelDetail from "./LevelDetail";

interface SpaceNodeDetailProps {
  // selectedNodeId: string;
  editMode: boolean;
  info: SpaceSearchResult | null;
}

interface State {
  // info: SpaceSearchResult | null;
}

export default function SpaceNodeDetail(props: SpaceNodeDetailProps) {
  const { editMode, info } = props;
  // const [{ info }, updateState] = useImmer<State>({
  //   info: null,
  // });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const {
    nodes,
    addChildNode,
    addNextNode,
    modifyNode,
    deleteNode,
  } = useContext(SpaceSettingPageContext);

  if (info) {
    return (
      <div className="detail">
        {/* {editMode && (
          <div className="nav">
            <a
              className={`${info.level === 3 && "disabled"}`}
              onClick={() => {
                if (info.level !== 3) {
                  addChildNode(info.node.id);
                }
              }}
            >
              新建子空间
            </a>
            <a
              onClick={() => {
                addNextNode(info.node.id);
              }}
            >
              新建下一节点
            </a>
            <a
              className={`${info.isOnlyChild ? "disabled" : "danger"}`}
              onClick={() => deleteNode(info.node.id)}
            >
              删除
            </a>
          </div>
        )} */}

        <div className="form">
          <BaseSpaceForm
            isEdit={editMode}
            info={{
              name: info.node.spaceName,
              description: info.node.spaceDescription,
              type: info.node.spaceType,
            }}
            onChangeInfo={(newInfo) => {
              // console.log(newInfo);

              const obj: SpaceTreeNode = {
                id: info.node.id,
                spaceType: info.node.spaceType,
                spaceName: newInfo.name,
                spaceDescription: newInfo.description,
              };

              // if (newInfo.value) {
              //   let val = parseFloat(newInfo.value) ?? 0;
              //   obj.spaceValue = val.toFixed(3);
              // }
              modifyNode(obj);
            }}
          />
        </div>

        {info.node.spaceType === "Region" && (
          <LevelDetail
            editMode={editMode}
            floors={info.node.subSpaces ?? []}
            onSave={(floors) => {
              const obj = { ...info.node, subSpaces: floors };
              modifyNode(obj);
            }}
          />
        )}
      </div>
    );
  } 
    return <div className="detail">暂无选中</div>;
  
}
