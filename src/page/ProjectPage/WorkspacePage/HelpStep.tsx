/* eslint-disable react/no-array-index-key */
import { Modal, Checkbox } from "antd";
import React, { FC, useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import BannerAnim from "rc-banner-anim";
import { TweenOneGroup } from "rc-tween-one";
import QueueAnim from "rc-queue-anim";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import consts from "consts";
import "./HelpStep.scss";
import { getCookie, setCookie } from "function/cookie.func";
import { Button } from "component/Antd";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { ViewType } from "./WorkspacePage";

const { PUBLIC_URL } = consts;
const { Element: BannerElement } = BannerAnim;

interface DataArray {
  pic: string;
  map: string;
  content?: string | React.ReactNode;
  title?: string;
  type: string;
}

const constDataArray: DataArray[] = [
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_1.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    title: "添加企业内普通账号",
    content: "支持添加、管理您的企业员工的账号，一起开展协同设计工作",
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_2.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    title: "下载设计工具，观看视频教程",
    content: (
      <>
        提供专业的设计工具的下载入口，并且安排培训视频，方便您详细了解设计工具的具体功能
        <br />
        以及如何运用它们完成一个示例项目
      </>
    ),
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_3.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    title: "创建项目",
    content: "支持项目信息及状态的设置；注意项目有数量限制",
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_4.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    title: "添加项目管理员",
    content: "支持从企业普通成员中为每一个项目按需配置管理员，协助管理项目",
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_5.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    title: "切换企业/个人工作台",
    content:
      "贴心配置双工作台界面，协助实现项目平台管理模式和设计模式的自由切换",
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce_6.png`,
    map: `${PUBLIC_URL}/assets/images/manage-help-banner-background.jpg`,
    type: "manage",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-1.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "下载设计工具，获取视频课程",
    content: (
      <>
        提供专业设计工具的下载入口，并且安排培训视频，方便您详细了解设计工具的具体功能
        <br />
        以及如何运用他们完成一个示例项目
      </>
    ),
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-2.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "已创建的项目列表",
    content:
      "展示所有与该账号相关的项目列表，管理人员需要点击进入项目完成初始化设置",
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-3.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "设置“协同团队”以及“工作单元”",
    content: (
      <>
        独创“工作单元协同机制”，管理人员需要依据项目合理分割项目团队，安排工作人员及工作内容；
        <br />
        更多细节请查看工作单元的相关课程
      </>
    ),
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-4.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "一键加载“项目构件库”和“机电公用模板”",
    content: (
      <>
        贴心的一键式加载服务，一处是常规建筑设计项目中高频使用的三维单元构件，
        <br />
        另一处是机电专业标准设计模板；注意后者只能用企业账号来加载
      </>
    ),
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-5.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "管理项目“标高”及“轴网”信息",
    content: (
      <>
        项目的“标高”和“轴网”在协同云平台进行统一管理，所有设计工具可直接读取
        <br />
        这些公用的项目设计信息；避免误操作导致设计信息不一致
      </>
    ),
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-6.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "完成项目初始化，打开设计工具继续工作",
    content:
      "完成项目初始化操作 -> 打开设计工具端 -> 登录账号 -> 进入协同面板 -> 选择工作单元 -> 开始三维设计工作",
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-7.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "团队协同、项目交付等其他功能",
    content: (
      <>
        广联达协同设计平台在完成项目初始化后，所有的设计成果可以在云端进行查看；
        <br />
        协同设计平台提供了“团队协同”以及“项目交付”等功能，具体内容可查阅相关的功能介绍课程
      </>
    ),
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-2-8.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    type: "personal",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-1.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "下载设计工具，获取视频课程",
    content: (
      <>
        提供专业设计工具的下载入口，并且安排培训视频，方便您详细了解设计工具的具体功能
        <br />
        以及如何运用他们完成一个示例项目
      </>
    ),
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-2.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "创建项目",
    content: "支持创建项目、设置项目的信息及状态（注意项目有数量限制）",
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-3.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "设置“协同团队”以及“工作单元”",
    content: (
      <>
        独创“工作单元协同机制”，管理人员需要依据项目合理分割项目团队，安排工作人员及工作内容；
        <br />
        更多细节请查看工作单元的相关课程
      </>
    ),
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-4.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "一键加载“项目构件库”和“机电公用模板”",
    content: (
      <>
        贴心的一键式加载服务，一处是常规建筑设计项目中高频使用的三维单元构件，
        <br />
        另一处是机电专业标准设计模板；注意后者只能用企业账号来加载
      </>
    ),
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-5.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "管理项目“标高”及“轴网”信息",
    content: (
      <>
        项目的“标高”和“轴网”在协同云平台进行统一管理，所有设计工具可直接读取
        <br />
        这些公用的项目设计信息；避免误操作导致设计信息不一致
      </>
    ),
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-6.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "完成项目初始化，打开设计工具继续工作",
    content:
      "完成项目初始化操作 -> 打开设计工具端 -> 登录账号 -> 进入协同面板 -> 选择工作单元 -> 开始三维设计工作",
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-7.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    title: "团队协同、项目交付等其他功能",
    content: (
      <>
        广联达协同设计平台在完成项目初始化后，所有的设计成果可以在云端进行查看；
        <br />
        协同设计平台提供了“团队协同”以及“项目交付”等功能，具体内容可查阅相关的功能介绍课程
      </>
    ),
    type: "individual",
  },
  {
    pic: `${PUBLIC_URL}/assets/images/introduce-3-8.png`,
    map: `${PUBLIC_URL}/assets/images/personal-help-banner-background.jpg`,
    type: "individual",
  },
];

interface HelpStepProps {
  type?: ViewType;
}
interface HelpStepState {
  oneEnter: boolean;
  visible: boolean;
  showInt: number;
  delay: number;
  imgAnim: any;
  dontShowAgain: boolean;
  dataArray: DataArray[];
}
function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}

const HelpStep: FC<HelpStepProps> = ({ type }) => {
  const [
    { visible, showInt, delay, dataArray, imgAnim, oneEnter, dontShowAgain },
    updateState,
  ] = useImmer<HelpStepState>({
    visible: false,
    showInt: 0,
    delay: 0,
    imgAnim: [
      { translateX: [0, 300], opacity: [1, 0] },
      { translateX: [0, -300], opacity: [1, 0] },
    ],
    oneEnter: false,
    dontShowAgain: false,
    dataArray: [],
  });
  const bannerImg = useRef<any>(null);
  const bannerText = useRef<any>(null);
  const [{ currentUser }] = useRecoilState(projectPageState);

  useEffect(() => {
    updateState((draft) => {
      draft.dontShowAgain = false;
    });

    if (type) {
      setTimeout(() => {
        const viewType = getQueryVariable("viewType");
        if (viewType ? viewType === type : type === ViewType.Manage) {
          const userId = getCookie("userId");
          const dontShowAgainUserListStr = localStorage.getItem(
            "dontShowAgain",
          );
          const shownListStr = getCookie("dontShowAgain");
          const dontShowAgainUserList: string[] = dontShowAgainUserListStr
            ? JSON.parse(dontShowAgainUserListStr)?.[type] || []
            : [];
          const shownList: string[] = shownListStr
            ? JSON.parse(shownListStr)?.[type] || []
            : [];

          if (
            userId &&
            !dontShowAgainUserList?.includes(userId) &&
            !shownList?.includes(userId)
          ) {
            updateState((draft) => {
              draft.dataArray = constDataArray.filter(
                (item) =>
                  item.type ===
                  (currentUser?.isPersonalAccount ? "individual" : type),
              );
              draft.visible = true;
            });
          }
        }
      }, 500);
    }
  }, [type, currentUser?.isPersonalAccount]);
  useEffect(() => {
    if (dataArray?.length) {
      bannerImg.current?.slickGoTo(0);
      bannerText.current?.slickGoTo(0);
      updateState((draft) => {
        draft.oneEnter = false;
        draft.showInt = 0;
      });
    }
  }, [dataArray]);

  const getDuration = (e: { key: string; index: number }) => {
    if (e.key === "map") {
      return 800;
    }
    return 1000;
  };
  const onChange = (changeType: string, current: number) => {
    if (changeType === "after") {
      updateState((draft) => {
        draft.showInt = current;
        draft.oneEnter = false;
      });
    } else {
      updateState((draft) => {
        draft.oneEnter = true;
        draft.delay = 300;
      });
    }
    // if (oneEnter) {
    //   updateState((draft) => {
    //     draft.delay = 300;
    //     draft.oneEnter = true;
    //   });
    // }
  };

  const onClose = () => {
    if (type) {
      const userId = getCookie("userId");
      const dontShowAgainUserListStr = localStorage.getItem("dontShowAgain");
      const shownListStr = getCookie("dontShowAgain");
      const dontShowAgainObj = dontShowAgainUserListStr
        ? JSON.parse(dontShowAgainUserListStr) || {}
        : {};
      const shownListObj = shownListStr ? JSON.parse(shownListStr) || {} : {};
      const dontShowAgainUserList: string[] = dontShowAgainUserListStr
        ? JSON.parse(dontShowAgainUserListStr)?.[type] || []
        : [];
      const shownList: string[] = shownListStr
        ? JSON.parse(shownListStr)?.[type] || []
        : [];

      if (dontShowAgain) {
        localStorage.setItem(
          "dontShowAgain",
          JSON.stringify({
            ...dontShowAgainObj,
            [type]: [...dontShowAgainUserList, userId],
          }),
        );
      }
      setCookie(
        "dontShowAgain",
        JSON.stringify({ ...shownListObj, [type]: [...shownList, userId] }),
      );
      updateState((draft) => {
        draft.visible = false;
      });
    }
  };

  const imgChildren = dataArray.map((item, i, list) => (
    <BannerElement
      key={i}
      style={{
        height: "100%",
      }}
      leaveChildHide
    >
      <QueueAnim
        animConfig={imgAnim}
        duration={getDuration}
        delay={[!i ? delay : 300, 0]}
        ease={["easeOutCubic", "easeInQuad"]}
        key="img-wrapper"
      >
        <div className={`banner-map map${i}`} key="map">
          <img src={item.map} width="100%" />
        </div>
        <div
          className={`banner-pic pic${i}${
            i === list.length - 1 ? " last" : ""
          }`}
          key="pic"
        >
          <img src={item.pic} width="100%" />
          {i === list.length - 1 && (
            <Button
              className="start"
              type="primary"
              shape="round"
              onClick={() => onClose()}
            >
              开启协同之旅
            </Button>
          )}
        </div>
      </QueueAnim>
    </BannerElement>
  ));
  const textChildren = dataArray.map((item, i, list) => {
    const { title, content } = item;
    return (
      <BannerElement key={i}>
        <QueueAnim
          type="bottom"
          duration={1000}
          delay={[!i ? delay + 500 : 800, 0]}
        >
          {i !== list.length - 1 ? (
            <>
              <h1 key="h1">{title}</h1>
              <p key="p">{content}</p>
            </>
          ) : null}
        </QueueAnim>
      </BannerElement>
    );
  });
  const onLeft = () => {
    let newShowInt = showInt;
    newShowInt -= 1;
    const newImgAnim = [
      { translateX: [0, -300], opacity: [1, 0] },
      { translateX: [0, 300], opacity: [1, 0] },
    ];
    if (newShowInt <= 0) {
      newShowInt = 0;
    }
    updateState((draft) => {
      // draft.showInt = newShowInt;
      draft.imgAnim = newImgAnim;
    });
    bannerImg.current?.prev();
    bannerText.current?.prev();
  };

  const onRight = () => {
    let newShowInt = showInt;
    const newImgAnim = [
      { translateX: [0, 300], opacity: [1, 0] },
      { translateX: [0, -300], opacity: [1, 0] },
    ];
    newShowInt += 1;
    if (newShowInt > dataArray.length - 1) {
      newShowInt = dataArray.length - 1;
    }
    updateState((draft) => {
      draft.showInt = newShowInt;
      draft.imgAnim = newImgAnim;
    });
    bannerImg.current?.next();
    bannerText.current?.next();
  };

  return (
    <Modal
      wrapClassName="help-step"
      width={960}
      footer={null}
      visible={visible}
      centered
      onCancel={onClose}
      maskClosable={false}
    >
      <div className="banner-wrapper">
        <div className="banner">
          <BannerAnim
            prefixCls="banner-img-wrapper"
            sync
            type="across"
            duration={1000}
            ease="easeInOutExpo"
            arrow={false}
            thumb={false}
            ref={(c: any) => {
              bannerImg.current = c;
            }}
            onChange={onChange}
            dragPlay={false}
          >
            {imgChildren}
          </BannerAnim>
          <BannerAnim
            prefixCls="banner-text-wrapper"
            sync
            type="across"
            duration={1000}
            arrow={false}
            thumb={false}
            ease="easeInOutExpo"
            ref={(c: any) => {
              bannerText.current = c;
            }}
            dragPlay={false}
          >
            {textChildren}
          </BannerAnim>
          {!oneEnter && (
            <TweenOneGroup
              enter={{ opacity: 0, type: "from" }}
              leave={{ opacity: 0 }}
            >
              {showInt && (
                <LeftOutlined
                  className="change-button left"
                  key="left"
                  onClick={onLeft}
                />
              )}
              {showInt < dataArray.length - 1 && (
                <RightOutlined
                  className="change-button right"
                  key="right"
                  onClick={onRight}
                />
              )}
            </TweenOneGroup>
          )}
        </div>
      </div>
      <span className="count-wrap">
        <span className="count">{showInt + 1}</span> / {dataArray.length}
      </span>
      <Checkbox
        className="dont-show-again"
        checked={dontShowAgain}
        onChange={(e) =>
          updateState((draft) => {
            draft.dontShowAgain = e.target.checked;
          })
        }
      >
        下次登录，不再播放
      </Checkbox>
    </Modal>
  );
};
export default HelpStep;
