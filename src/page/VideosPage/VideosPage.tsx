import React, { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import consts from "consts";
import axios from "axios";
import {
  List,
  Button,
  Form,
  Input,
  message,
  Empty,
  Space,
  Typography,
} from "antd";
import { authService, loginService } from "service";
import { useHistory, Link, useRouteMatch } from "react-router-dom";
import { VideosParams } from "model/route-params.model";
import "./VideosPage.scss";

declare const Aliplayer: any;
const { PUBLIC_URL, API_BASE_STRUC_URL } = consts;

const TitleMaps = {
  garch: "广联达建筑设计基础功能教程",
  gstr: "广联达结构设计基础功能教程",
  gmep: "广联达机电设计基础功能教程",
  gdcp: "广联达协同设计平台 / 基础功能教程",
  cases: "广联达协同设计平台 / 案例项目",
};

export interface VideosPageProps {}

export interface State {
  playauth: string;
  videos: any[];
  selectedVideo: any;
}

export default function VideosPage(props: VideosPageProps) {
  const {} = props;

  const {
    url,
    path,
    params: { album },
  } = useRouteMatch<VideosParams>();

  const { replace } = useHistory();
  const player = useRef<any>(null);

  const [{ playauth, videos, selectedVideo }, updateState] = useImmer<State>({
    playauth: "",
    videos: [],
    selectedVideo: null,
  });

  const clickVideo = (_selectedVideo: any) => {
    axios
      .get(
        `${API_BASE_STRUC_URL}/design/resource/signature/vcr/${_selectedVideo.id}/url`,
      )
      .then((res) => {
        const _url = res?.data?.data;

        updateState((draft) => {
          draft.selectedVideo = _selectedVideo;
          draft.playauth = _url;
        });
      });
    // .catch((err) => message.error("下载资源失败，请稍后再试"));
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_STRUC_URL}/design/resource/signature/vcr/${album}/list`)
      .then((res) => {
        const _videos = res?.data?.data?.videos ?? [];
        const firstVideo = _videos?.[0];
        updateState((draft) => {
          draft.videos = _videos;
          // draft.selectedVideo = firstVideo;
        });

        clickVideo(firstVideo);
      });
    // .catch((err) => message.error("下载资源失败，请稍后再试"));
  }, []);

  useEffect(() => {
    if (playauth) {
      if (player.current) {
        (player.current as any).replayByVidAndPlayAuth(
          selectedVideo.content,
          playauth,
        );
        // (player.current as any).play();
        (player.current as any).setCover(selectedVideo.thumbnail);
      } else {
        player.current = new Aliplayer(
          {
            id: "J_prismPlayer",
            width: "100%",
            autoplay: true,

            vid: selectedVideo.content,
            playauth,
            authTimeout: 7200,
            cover: selectedVideo.thumbnail,
            encryptType: 1,
          },
          (_player: any) => {
            console.log("播放器创建好了。");
          },
        );
      }
    }
  }, [playauth]);

  if (
    album === "garch" ||
    album === "gmep" ||
    album === "gstr" ||
    album === "gdcp" ||
    album === "cases"
  ) {
    return (
      <div className="videos-page">
        <div className="videos-page-wrap">
          <div className="wideos-page-header">
            <h1 className="videos-page-title">{TitleMaps[album]}</h1>
            <h3 className="videos-page-name">{selectedVideo?.title}</h3>
          </div>
          <div className="prism-player-wrap">
            <div
              className="prism-player"
              id="J_prismPlayer"
              onClick={(event) => {
                if (
                  event.target ===
                    document
                      .getElementById("J_prismPlayer")
                      ?.getElementsByTagName("video")[0] &&
                  player.current?.getStatus() === "playing"
                ) {
                  (document.querySelector(".prism-play-btn") as any)?.click();
                }
              }}
            />
          </div>
          <List
            className="videos-list"
            header={<div>教程分集</div>}
            bordered
            dataSource={videos}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => clickVideo(item)}
                className={[
                  "ant-list-item",
                  item?.id === selectedVideo?.id ? "active" : "",
                ].join(" ")}
                key={item.id}
              >
                {item.title}
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  }

  return <Empty />;
}
