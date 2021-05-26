/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, notification, Button, message } from "antd";
import { onResponseError } from "function/auth.func";
import { renameFileName, parseFileName } from "function/string.func";
import { upperCase, lowerCase } from "lodash";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { ChangeEvent, useContext, useEffect, useRef } from "react";
import {
  fontService,
} from "service";
import { useImmer } from "use-immer";
import { ProjectFontVO } from "api-struc/generated/model";

export interface UploadFontButtonProps {
  title?: string;
  disabled?: boolean;
  renderAsLink?: boolean;
  projectId: string;
  fontList: ProjectFontVO[];
  onComplete: () => void;
}

export interface State {
  uploading: boolean;
  progress: number;
}

export default function UploadFontButton(props: UploadFontButtonProps) {
  const {
    title,
    disabled,
    fontList,
    projectId,
    renderAsLink,
    onComplete,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [{ uploading, progress }, updateState] = useImmer<State>({
    uploading: false,
    progress: 0,
  });
  const {} = useContext(ProjectPageContext);

  function onExit() {
    if (fileInputRef.current?.value) fileInputRef.current!.value = "";
    updateState((draft) => {
      draft.uploading = false;
      draft.progress = 0;
    });
  }

  function handleUpload(name: string, fileType: string, _file: File) {
    if (!_file) return;
    updateState((draft) => {
      draft.uploading = true;
    });
    fontService
      .uploadFont(name, projectId, _file, (precent) => {
        updateState((draft) => {
          draft.progress = precent;
        });
      })
      .then((fileOSSPath) =>
        fontService.addFont(fileType, name.substr(-39), projectId, fileOSSPath),
      )
      .then(onComplete)
      .then(() => {
        message.success("上传成功");
      })
      .catch(onResponseError)
      .finally(() => {
        onExit();
      });
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const _file = e.target.files[0];

      const { name, extension } = parseFileName(_file.name);

      const fileType = upperCase(extension);

      if (fileType === "SHX" || fileType === "TTF" || fileType === "TTC") {
        if (
          fontList.find(
            (font) => lowerCase(font.name) === lowerCase(_file.name),
          )
        ) {
          // 循环重命名
          let newName = `${name}(1)`;
          while (
            // eslint-disable-next-line no-loop-func
            fontList.find((font) =>lowerCase(font.name) === lowerCase(`${newName}.${fileType}`))
          ) {
            newName = `${newName}(1)`;
          }

          Modal.confirm({
            title: `重名提示`,
            content: `存在同名文件，是否上传为“${newName}.${fileType}”`,
            onOk() {
              handleUpload(`${newName}.${fileType}`, fileType, _file);
            },
            okText: "继续",
            onCancel() {
              message.warning("上传已取消");
              onExit();
            },
          });
        } else {
          handleUpload(`${name}.${fileType}`, fileType, _file);
        }
      } else {
        message.error("格式错误");
      }
    }
  }

  const percent = Math.ceil(progress * 100);
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ttf, .shx, .ttc"
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
        {!uploading && <>{title ?? "上传"}</>}
        {uploading && percent < 100 && <> 正在上传 {percent}%</>}
        {uploading && percent === 100 && <> 后续处理</>}
      </Button>
    </>
  );
}
