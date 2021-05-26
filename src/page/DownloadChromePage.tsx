import React from "react";
import { useImmer } from "use-immer";
import "../App.less";
import { Modal } from "antd";

export interface DownloadChromePageProps {}

export interface State {}

export default function DownloadChromePage(props: DownloadChromePageProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return (
    <div style={{ padding: 30 }}>
      <Modal visible closable={false} style={{ top: 220 }} footer={null}>
        <div style={{ display: "flex" }}>
          <div style={{ paddingRight: 14, fontSize: 16, paddingTop: 3 }}>
            <span style={{ color: "#faad14" }}>
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="exclamation-circle"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" />
              </svg>
            </span>
          </div>
          <div>
            <h3>检测到浏览器版本不兼容</h3>
            <p style={{ color: "#667" }}>
              请安装 64.0 以上版本 Chrome 浏览器以体验广联达协同设计平台
            </p>
            <h2 style={{ textAlign: "right" }}>
              <a
                href="https://pc.qq.com/detail/1/detail_2661.html"
                target="download-chrome"
                style={{
                  color: "#333",
                  border: "1px solid #ccc",
                  fontSize: 14,
                  padding: "5px 8px",
                  borderRadius: 3,
                }}
              >
                下载 Chrome 浏览器
              </a>
            </h2>
          </div>
        </div>
      </Modal>
    </div>
  );
}
