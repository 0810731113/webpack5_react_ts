import { Checkbox, Radio } from "antd";
import { Project, ProjectStatusEnum, ProjectVO } from "api/generated/model";
import React, { FC, useEffect, useState } from "react";
import { projectStatusList } from "./WorkspacePage";

interface ProjectFilterProps {
  projects?: (Project | ProjectVO)[];
  onStatusChange?: (status: ProjectStatusEnum[]) => void;
  projectStatus?: any;
  creatButton?: false | JSX.Element;
  type?: "checkbox" | "radio";
}

const ProjectFilter: FC<ProjectFilterProps> = ({
  projects,
  onStatusChange,
  projectStatus,
  creatButton,
  type,
}) => {
  const [statusList, setStatusList] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  useEffect(() => {
    setStatusList(
      projectStatusList.filter((status) =>
        status.value
          ? projects?.some((project) => project.status === status.value)
          : type !== "checkbox",
      ),
    );
  }, [projectStatusList, projects]);
  const GroupBase = type === "checkbox" ? Checkbox : Radio;
  return (
    <div className="inline-header">
      <span>
        项目{type === "checkbox" ? "状态" : "筛选"}：
        <GroupBase.Group
          size="small"
          options={statusList}
          onChange={(e: any) => {
            if (type === "checkbox") {
              onStatusChange?.(e);
            } else {
              onStatusChange?.([e.target.value]);
            }
          }}
          value={
            (type === "checkbox"
              ? projectStatus && Array.isArray(projectStatus)
                ? projectStatus
                : [projectStatus]
              : projectStatus?.toString()) || ""
          }
          optionType="button"
        />
      </span>
      {creatButton}
    </div>
  );
};
export default ProjectFilter;
