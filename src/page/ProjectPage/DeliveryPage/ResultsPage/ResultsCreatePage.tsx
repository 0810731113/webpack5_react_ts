import React, { useEffect, useState } from "react";
import { Switch, Route, useRouteMatch, Prompt, useHistory } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button } from "component/Antd";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { useRequest } from "@umijs/hooks";
import { workUnitService, integratePackagesService } from "service";
import { DataSetVO, VersionVO } from "api/generated/model";
import { Table, Space, Input, message, Checkbox } from "antd";
import Loading from "component/Loading";
import WorkUnitList from "component/WorkUnitList";
import { size } from "lodash";

interface ResultsCreatePageProps {}

interface State {
  name: string;
  workUnits: DataSetVO[] | null;
  checkedVersionIds: number[];
  versions: { [workUnitId: string]: VersionVO[] };
}

export default function ResultsCreatePage(props: ResultsCreatePageProps) {
  const {} = props;
  const [
    { workUnits, versions, checkedVersionIds, name },
    updateState,
  ] = useImmer<State>({
    name: "",
    workUnits: null,
    versions: {},
    checkedVersionIds: [],
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const { replace } = useHistory();

  const [leaveConfirm, setLeaveConfirm] = useState(true);

  const { loading, data, run } = useRequest(
    () =>
      workUnitService
        .listWorkUnitsByProjectId(projectId, "committed")
        .then((_workUnits) =>
          workUnitService
            .batchLoadCommittedWorkUnitsVersions(
              _workUnits!.map((wu) => wu.id!),
            )
            .then((_versions) => ({
              workUnits: _workUnits!,
              versions: _versions!,
            })),
        )
        .then((_data) => {
          updateState((draft) => {
            draft.workUnits = _data.workUnits!;
            draft.versions = _data.versions!;
          });
        }),
    { manual: true },
  );

  useEffect(() => {
    run();
  }, []);

  const create = () => {
    if (!name) {
      message.error("未输入交付单元名称");
      return;
    }
    if (!checkedVersionIds || size(checkedVersionIds) === 0) {
      message.error("未选择集成内容");
      return;
    }

    setLeaveConfirm(false);

    integratePackagesService
      .createIntegreate(projectId, name, "")
      .then((pkg) => {
        if (pkg && pkg.id) {
          return integratePackagesService.postIntegrateResources(
            pkg.id,
            checkedVersionIds,
          );
        }
        return null;
      })
      .then(() => {
        message.warn("交付单元创建成功，正在转换中");
        replace(url.replace("/create", ""));
      });
  };

  const cancel = () => {
    replace(url.replace("/create", ""));
  };

  const combinedViewerUrl = () => {
    const tmpurl = `/model-viewer?versionIdList=${checkedVersionIds.join(
      ",",
    )}&format=gap`;
    return tmpurl;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Prompt when={leaveConfirm} message="是否放弃创建交付单元" />

      <div className="header">
        <Space>
          <span style={{ color: "red" }}>*</span>
          <span>交付单元名称：</span>
          <Input
            placeholder="请输入"
            value={name}
            style={{ width: "30vw" }}
            onChange={(e) => {
              const text = e.target.value;
              updateState((draft) => {
                draft.name = text;
              });
            }}
          />
        </Space>

        <Button disabled={size(checkedVersionIds) === 0}>
          <Link to={combinedViewerUrl()} target="_blank">
            预览选中
          </Link>
        </Button>
      </div>

      <div className="body">
        {/* <div>
          <Checkbox disabled>仅显示选中</Checkbox>
        </div> */}
        <div
          className="table-content"
          style={{ position: "relative", height: "100%" }}
        >
          <WorkUnitList
            workUnits={workUnits ?? []}
            versions={versions}
            onReload={run}
            mode="integrate"
            disableToolbar
            setCheckedVersionIds={(versionIds) => {
              updateState((draft) => {
                draft.checkedVersionIds = versionIds;
              });
            }}
          />
        </div>
      </div>
      <div className="footer">
        <div>
          <Button type="primary" ghost onClick={cancel}>
            取消
          </Button>
          <Button type="primary" onClick={create} style={{ marginLeft: 8 }}>
            创建
          </Button>
        </div>
      </div>
    </>
  );
}
