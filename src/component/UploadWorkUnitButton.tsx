/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-key */
/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, notification } from "antd";
import { DataSet } from "api/generated/model";
import { onResponseError } from "function/auth.func";
import { renameFileName } from "function/string.func";
import { last, lowerCase } from "lodash";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { ChangeEvent, useContext, useEffect, useRef } from "react";
import {
  fileService,
  workUnitService,
  versionService,
  bfproxyService,
} from "service";
import { useImmer } from "use-immer";
import { publishEvent } from "function/stats.func";
import Button from "./Button";

export interface UploadWorkUnitButtonProps {
  title?: string;
  disabled?: boolean;
  renderAsLink?: boolean;
  workUnitId?: string;
  folderId: string;
  teamId?: string;
  asNewVersion?: boolean;
  workUnitList: DataSet[];
  onComplete: () => void;
}

export interface State {
  uploading: boolean;
  progress: number;
  showConfirmDialog?: boolean;
  file?: File;
  existedWorkUnitId?: string;
}

export default function UploadWorkUnitButton(props: UploadWorkUnitButtonProps) {
  const {
    folderId,
    teamId,
    title,
    disabled,
    workUnitList,
    workUnitId,
    asNewVersion,
    renderAsLink,
    onComplete,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [
    { uploading, progress, file, existedWorkUnitId, showConfirmDialog },
    updateState,
  ] = useImmer<State>({
    uploading: false,
    progress: 0,
    existedWorkUnitId: workUnitId,
  });
  const {} = useContext(ProjectPageContext);

  useEffect(() => {
    updateState((draft) => {
      draft.existedWorkUnitId = workUnitId;
    });
  }, [workUnitId]);

  if (!folderId) return null;
  function handleUpload(file?: File, saveAsNewVersion = false) {
    if (!file) return;
    updateState((draft) => {
      draft.showConfirmDialog = false;
      draft.uploading = true;
    });
    fileService
      .doUpload(file, (precent) => {
        updateState((draft) => {
          draft.progress = precent;
        });
      })
      .then((info) => {
        if (asNewVersion || saveAsNewVersion) {
          return workUnitService.createVersion(
            existedWorkUnitId!,
            info?.fileOSSPath!,
          );
        }
        let fileName = file.name;
        const type = lowerCase(last(file?.name?.split(".")));
        const workUnit = workUnitList.find((wu) => wu.name === file.name);
        if (workUnit) {
          fileName = renameFileName(
            fileName,
            workUnitList.map((wu) => wu.name!),
          );
        }
        return workUnitService
          .createWorkUnit(folderId, fileName, type, teamId)
          .then((currentWorkUnit) =>
            workUnitService.createVersion(
              currentWorkUnit.id!,
              info?.fileOSSPath!,
            ),
          );
      })
      .then((version) => {
        const type = lowerCase(last(file?.name?.split(".")));
        return bfproxyService.startWorker(version.id!, type);
      })
      .then(onComplete)
      .then(() => {
        notification.success({
          message: "文件已上传",
          placement: "bottomRight",
        });
      })
      .catch(onResponseError)
      .finally(() => {
        fileInputRef.current!.value = "";
        updateState((draft) => {
          draft.uploading = false;
          draft.file = undefined;
          draft.showConfirmDialog = false;
          draft.progress = 0;
        });
      });
  }
  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const file = e.target.files[0];
      if (!asNewVersion) {
        updateState((draft) => {
          const workUnit = workUnitList.find((wu) => wu.name === file.name);
          if (workUnit) {
            draft.showConfirmDialog = true;
            draft.file = file;
            draft.existedWorkUnitId = workUnit?.id;
          } else {
            handleUpload(file);
          }
        });
      } else {
        handleUpload(file, true);
      }
    }
  }

  const percent = Math.ceil(progress * 100);
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />
      <Button
        type={renderAsLink ? "link" : "primary"}
        loading={uploading}
        disabled={uploading || disabled}
        onClick={() => fileInputRef.current!.click()}
        style={renderAsLink ? { padding: 0, minWidth: 0 } : {}}
      >
        {!uploading && <>{title ?? "上传文件"}</>}
        {uploading && percent < 100 && <> 正在上传 {percent}%</>}
        {uploading && percent === 100 && <> 后续处理</>}
      </Button>
      <Modal
        visible={showConfirmDialog}
        closable={false}
        title="确认上传模式"
        footer={[
          <Button type="primary" onClick={() => handleUpload(file, true)}>
            上传新版本
          </Button>,
          <Button onClick={() => handleUpload(file, false)}>上传新文件</Button>,
          <Button
            onClick={() =>
              updateState((draft) => {
                draft.showConfirmDialog = false;
              })
            }
          >
            取消
          </Button>,
        ]}
      >
        <p>发现同名文件，请确认保存模式</p>
      </Modal>
    </>
  );
}
