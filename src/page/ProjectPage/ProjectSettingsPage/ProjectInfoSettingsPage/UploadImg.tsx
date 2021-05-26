import React, { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import consts from "consts";
import { Upload, message } from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import Iconfont from "component/Iconfont";
import { RcFile, UploadChangeParam } from "antd/lib/upload";

const { API_BASE_URL } = consts;

interface UploadImageProps {
  value?: string;
  onChange?: (url: any) => void;
  allowClear?: boolean;
  style?: React.CSSProperties;
  isViolation?: boolean;
}

interface State {}

export default function UploadImage(props: UploadImageProps) {
  const { style, value, onChange, isViolation } = props;
  const [{}, updateState] = useImmer<State>({});

  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  function getBase64(img: Blob | File, callback: (url: any) => void) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj!, (_url: string) => {
        setLoading(false);
        setImgUrl(_url);
      });
      onChange?.(info.file.response);
    }
  };

  useEffect(() => {
    if (value) {
      setImgUrl(value);
    }
  }, [value]);

  function beforeUpload(file: RcFile) {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("只能上传.jpg 和 .png格式");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片必须小于2M");
    }
    return isJpgOrPng && isLt2M;
  }

  return (
    <Upload
      name="file"
      method="put"
      listType="picture-card"
      className={isViolation ? "upload-has-error" : ""}
      showUploadList={false}
      action={`${API_BASE_URL}/file/upload`}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imgUrl ? (
        <>
          <img
            src={imgUrl}
            alt="avatar"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          {isViolation && (
            // <ExclamationCircleFilled
            //   style={{ position: "absolute", color: "red", fontSize: 100 }}
            // />
            <Iconfont
              type="icon-anquanjinggao"
              style={{ position: "absolute", fontSize: 100 }}
            />
          )}
        </>
      ) : (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div>上传图像</div>
        </div>
      )}
    </Upload>
  );
}
