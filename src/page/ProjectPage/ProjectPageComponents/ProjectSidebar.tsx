import {
  BranchesOutlined,
  FileDoneOutlined,
  SettingOutlined,
  TeamOutlined,
  DeliveredProcedureOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import Iconfont from "component/Iconfont";
import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import consts, { NAV as n, defaultScrollbarSettings } from "consts";
import { ProjectParams } from "model/route-params.model";
import React, { FC, useEffect } from "react";
import { Link, useLocation, useRouteMatch, LinkProps } from "react-router-dom";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { Scrollbars } from "react-custom-scrollbars";
import { useMyTeams } from "hook/use-team-users.hook";
import * as H from "history";
import { MenuItemProps } from "antd/lib/menu/MenuItem";

const { ENV } = consts;
interface ProjectSidebarProps {
  projectName: string;
  selectedMenuKey: string;
}

export default function ProjectSidebar(props: ProjectSidebarProps) {
  const { selectedMenuKey } = props;
  const {
    url,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [{ myTeams }, setState] = useRecoilState(projectPageState);
  const { myTeams: myTeamsByProjectId, loading } = useMyTeams(projectId);
  const { pathname } = useLocation();
  const paths = pathname.split("/");
  const teamId = myTeams && myTeams[0]?.id;
  useEffect(() => {
    setState((pre) => ({
      ...pre,
      myTeams: myTeamsByProjectId ?? null,
    }));
  }, [myTeamsByProjectId]);
  const MenuItem: FC<MenuItemProps> = (menuProps) => {
    const pointerEvents =
      menuProps.eventKey === selectedMenuKey ? "none" : "auto";
    return (
      <Menu.Item
        {...menuProps}
        style={{
          pointerEvents,
        }}
      />
    );
  };
  return (
    <div className="sidebar">
      <Scrollbars {...defaultScrollbarSettings}>
        <Menu
          className="nav"
          mode="inline"
          inlineIndent={24}
          defaultOpenKeys={[
            n.appsSection,
            n.settingsSection,
            n.workUnitSection,
          ]}
          selectedKeys={[selectedMenuKey]}
        >
          <MenuItem
            key={n.overviewBoard}
            icon={<Iconfont type="icon-xiangmukanban" />}
          >
            <Link to={`${url}/overview`}>项目看板</Link>
          </MenuItem>
          <MenuItem
            key={n.personalSection}
            icon={<Iconfont type="icon-daohangtubiao-gerensheji" />}
          >
            <Link to={`${url}/personal`}>个人设计</Link>
          </MenuItem>
          <MenuItem
            key={n.collaborationSection}
            title="团队协同"
            icon={<Iconfont type="icon-daohangtubiao-tuanduixietong" />}
          >
            <Link
              onClick={(event) => {
                if (pathname.indexOf(`${url}/collaboration/teams/`) !== -1) {
                  event.preventDefault();
                }
              }}
              to={`${url}/collaboration/teams/${teamId}/overview/workunits`}
            >
              团队协同
            </Link>
          </MenuItem>
          <MenuItem
            key={n.projectArchive}
            icon={<Iconfont type="icon-daohangtubiao-xiangmujiaofu" />}
          >
            <Link to={`${url}/delivery`}>项目交付</Link>
          </MenuItem>

          <MenuItem
            key={n.appsSection}
            icon={<Iconfont type="icon-daohangtubiao-kuozhanyingyong" />}
          >
            <Link to={`${url}/apps`}>扩展应用</Link>
          </MenuItem>

          <SubMenu
            key={n.settingsSection}
            title="项目配置"
            icon={<Iconfont type="icon-daohangtubiao-chushihuashezhi" />}
          >
            <MenuItem key={n.settingsProjectOverview}>
              <Link to={`${url}/settings/project-info`}>项目信息</Link>
            </MenuItem>
            <MenuItem key={n.settingsProjectSettings}>
              <Link to={`${url}/settings/collaboration`}>协同设置</Link>
            </MenuItem>

            {/* <SubMenu title="空间定位">
              <MenuItem key={n.settingsZhouWang}>
                <Link to={`${url}/settings/grid`}>轴网</Link>
              </MenuItem>
              <MenuItem key={n.settingsKongJianBiaoGao}>
                <Link to={`${url}/settings/space`}>空间和标高</Link>
              </MenuItem>
            </SubMenu> */}

            <SubMenu title="通用配置">
              <MenuItem key={n.settingsGouJianKu}>
                <Link to={`${url}/settings/structure`}>项目构件库</Link>
              </MenuItem>
              <MenuItem key={n.settingsYangShiKu}>
                <Link to={`${url}/settings/stylelib`}>项目样式库</Link>
              </MenuItem>
              {/* <MenuItem key={n.settingsGouJianKu}>
                <Link to={`${url}/settings/structure`}>视图样板</Link>
              </MenuItem> */}
              <MenuItem key={n.settingsJiDian}>
                <Link to={`${url}/settings/newgmep`}>软件配置</Link>
              </MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
      </Scrollbars>
    </div>
  );
}
