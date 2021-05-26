import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Divider, Avatar, Card, Tabs, message, Tooltip } from "antd";
import { useImmer } from "use-immer";
import { ProjectRole } from "service/role.service";
import { roleService } from "service";
import {
  ResourcePermission,
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";

import Iconfont from "component/Iconfont";

const { Meta } = Card;

const PageData = [
  {
    name: "个人设计",
    icon: "icon-daohangtubiao-gerensheji",
    modules: [
      {
        name: "工作单元（个人）",
        id: ResourcePermissionResourceEnum.PersonalDataset,
        description: (
          <div>
            开启权限后，您可以统一管理您所负责的所有工作单元的草稿版本，查看/整合查看工作单元的不同版本，对工作单元进行恢复操作。
            <Tooltip title="工作单元是用户独立的工作空间，不同用户可以通过不同工作单元进行协同工作。每位用户可以负责一个或多个工作单元。工作单元可以用广联达建筑设计\广联达结构设计\广联达机电设计等工具软件打开绘制，并在广联达协同设计平台进行统一存储和管理。">
              <a>（工作单元是什么？）</a>
            </Tooltip>
          </div>
        ),
      },
    ],
  },
  {
    name: "团队协同",
    icon: "icon-daohangtubiao-tuanduixietong",
    modules: [
      {
        name: "工作单元（团队）",
        id: ResourcePermissionResourceEnum.TeamDataset,
        description: (
          <div>
            开启权限后，您可以将您所负责的工作单元提交至团队协同，允许本团队和实时协同团队内成员查看、整合查看、版本对比这些工作单元，并在工具软件上进行参照。
          </div>
        ),
      },
      {
        name: "提资",
        id: ResourcePermissionResourceEnum.SharePackage,
        description: (
          <div>
            开启权限后，您可以创建资料包，将指定的工作单元提送给其他团队，方便其他团队成员在设计过程中进行参照。所有提交资料包的记录会形成记录表，便于您的查看。
          </div>
        ),
      },
      {
        name: "收资",
        id: ResourcePermissionResourceEnum.AcceptPackage,
        description: (
          <div>
            开启权限后，您可以预览并接收其他团队提送的资料包，方便团队内成员在设计过程中进行参照。接收资料包的记录会形成记录表，便于您的查看。
          </div>
        ),
      },
      {
        name: "实时协同团队",
        id: ResourcePermissionResourceEnum.PermissionTeam,
        description: (
          <div>
            开启权限后，您可以添加、查看、移除实时协同团队。
            <Tooltip title="实时协同团队是一种团队类型，实时协同团队内的成员无须通过提收资操作，就可以随时随地参照您团队中所有提交的工作单元，以便快速开展合作。">
              <a>（实时协同团队是什么？）</a>
            </Tooltip>
          </div>
        ),
      },
      {
        name: "问题",
        id: ResourcePermissionResourceEnum.Issue,
        description: (
          <div>
            开启权限后，您可以轻量化查看页上创建、查看、定位在协同过程中产生的各类问题，在问题管理页面查看所有问题，并跟踪问题状态，以及时协调设计工作。
          </div>
        ),
      },
      {
        name: "其他文档",
        id: ResourcePermissionResourceEnum.OtherFile,
        description: (
          <div>
            开启权限后，您可以统一管理团队下设计开展所需要的各类文件资料，支持除工作单元外的文件类型的上传、下载、查看、更新、删除等操作。
          </div>
        ),
      },
    ],
  },
  {
    name: "项目交付",
    icon: "icon-daohangtubiao-xiangmujiaofu",
    modules: [
      {
        name: "资源池",
        id: ResourcePermissionResourceEnum.ResourcePool,
        description: (
          <>
            <div>
              交付单元由一个或多个工作单元集成创建而来。开启权限后，您可以创建、查看、编辑、删除交付单元等用于交付的资源。
            </div>
            <div>（更多交付资源正在开发中，敬请期待）</div>
          </>
        ),
      },
      {
        name: "交付包",
        id: ResourcePermissionResourceEnum.ArchivePackage,
        description: (
          <div>
            您可以创建、编辑、交付、删除交付包，下载交付包中的资源，查看交付包与交付记录。被交付用户可在广联达BIMMAKE软件上查看并导入交付包中的广联达结构设计软件的交付模型。
            <Tooltip title="您可将资源池中的多种类型的交付资源进行打包，组成项目交付包，并指定给相应的交付用户进行设计成果的交付。">
              <a>（交付包是什么？）</a>
            </Tooltip>
          </div>
        ),
      },
    ],
  },
  {
    name: "扩展应用",
    icon: "icon-daohangtubiao-kuozhanyingyong",
    modules: [
      {
        name: "碰撞检测",
        id: ResourcePermissionResourceEnum.CollisionDetection,
        description: (
          <div>
            开启权限后，您可以针对指定的工作单元发起碰撞检测，支持查看、筛选、定向推送特定碰撞点结果至工具的软件，并支持添加协同处理方案，以实现碰撞点快速定位、设计调整优化。
            <Tooltip title="碰撞检测可以检测自碰撞、硬碰撞、软碰撞等各种不同类型、多工作单元之间的碰撞检测冲突，并将碰撞点以问题的形式定向推送给相关负责人进行设计调整优化。">
              <a>（碰撞检测是什么？）</a>
            </Tooltip>
          </div>
        ),
      },
    ],
  },
  {
    name: "设置",
    icon: "icon-daohangtubiao-chushihuashezhi",
    modules: [
      {
        name: "项目信息",
        id: ResourcePermissionResourceEnum.ProjectSummary,
        description: (
          <div>
            开启权限后，您可以设置项目名称、状态、封面、简介、地址、设计单位等信息，并应用到广联达各专业设计软件。
          </div>
        ),
      },
      {
        name: "协同设置",
        id: ResourcePermissionResourceEnum.CollaborationSetting,
        description: (
          <div>
            开启权限后，您可以创建并管理项目中的团队，并为团队添加团队成员和配置团队的工作单元，完成团队、成员、工作单元的配置和管理工作，您也可以自定义为项目配置角色，管理项目成员权限。
          </div>
        ),
      },
      // {
      //   name: "空间定位",
      //   id: ResourcePermissionResourceEnum.ProjectSetting,
      //   description: <div>开启权限后，您可以查看、编辑空间和标高、轴网。</div>,
      // },
      {
        name: "通用配置 - 项目构件库",
        id: ResourcePermissionResourceEnum.GJK,
        description: (
          <>
            <div>
              开启权限后，您可以添加构件至项目构件库，并编辑、删除项目构件。
              <Tooltip title="项目构件库提供项目级多专业、海量的细分构件，贴心提供云端中心化构件数据管理，同时支持广联达设计软件中载入工作单元使用，提升建模效率，降低项目成本。">
                <a>（项目构件库是什么？）</a>
              </Tooltip>
            </div>
          </>
        ),
      },
      {
        name: "通用配置 - 项目样式库",
        id: ResourcePermissionResourceEnum.GeneralConfigurationStyleLib,
        description: (
          <>
            <div>
              开启权限后，您可以在为项目样式库上传、编辑字体素材。
              <Tooltip title="项目级别的“样式素材库”，提供项目级“样式素材”，贴心提供云端中心化样式数据管理，同时支持广联达设计软件中共享并使用这些素材。">
                <a>（项目样式库是什么？）</a>
              </Tooltip>
            </div>
            <div>（更多样式库内容正在努力研发中，敬请期待）</div>
          </>
        ),
      },
      {
        name: "通用配置 - 软件配置",
        id: ResourcePermissionResourceEnum.GeneralConfigurationSoftSetting,
        description: (
          <>
            <div>
            开启权限后，您可以初始化、查看、编辑与软件相关的设置。
            </div>
            <div>（目前仅支持广联达机电设计软件，其他软件的相关配置正在努力研发中，敬请期待）</div>
          </>
        ),
      },
    ],
  },
];

interface PermissionDetailsProps {
  role: ProjectRole;
}

interface State {
  data: ResourcePermission[];
}

export default function PermissionDetails(props: PermissionDetailsProps) {
  const { role } = props;
  const [{ data }, updateState] = useImmer<State>({ data: [] });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    roleService.getUserRolePermissions(role).then((_data) => {
      updateState((draft) => {
        draft.data = _data ?? [];
      });
    });
  }, [role]);

  return (
    <div>
      {PageData.map((module) => (
        <div className="module" key={module.name}>
          <Divider orientation="left" plain style={{ borderColor: "#efefef" }}>
            <Iconfont type={module.icon} />
            <span className="divider-title">{module.name}</span>
          </Divider>
          {module.modules.map((item) => {
            const thisItem = data.find((ele) => ele.resource === item.id);

            if (!thisItem) {
              return null;
            }

            const isWrite = thisItem.permissionTypes?.includes(
              ResourcePermissionPermissionTypesEnum.Write,
            );
            return (
              <Card key={item.id}>
                <Meta
                  avatar={
                    isWrite ? (
                      <Avatar style={{ background: "#13c2c2" }}>Edit</Avatar>
                    ) : (
                      <Avatar>Read</Avatar>
                    )
                  }
                  title={item.name}
                  description={item.description}
                />
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
