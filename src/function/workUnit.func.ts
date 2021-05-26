import { Team, DataSetVO } from "api/generated/model";

export interface TreeNode extends Team, DataSetVO {
  children?: TreeNode[];
  nodeType: "all" | "team" | "workUnit";
  disabled?: boolean;
}

export function transTeamWorkUnitTreeData({
  teams,
  workUnits,
}: {
  teams: Team[];
  workUnits: DataSetVO[];
}): TreeNode[] {
  return [
    {
      id: "all",
      name: "全部",
      nodeType: "all",
      children: teams.map((team) => ({
        ...team,
        children: workUnits
          .filter((unit) => unit.teamId === team.id)
          .map((unit) => ({
            ...unit,
            nodeType: "workUnit",
          })),
        nodeType: "team",
      })),
    },
  ];
}

export function mapWorkUnitBySpecialtyIdToTeam(
  workunits: DataSetVO[],
  specialtyId: string | null | undefined,
) {

  let arr = workunits;  // specialtyId 为空，拿所有的
  
  if (specialtyId) {
    arr = workunits.filter((ds) => ds.specialtyId === specialtyId);
  }

  return arr.reduce<{ [teamId: string]: DataSetVO[] }>((pre, current) => {
    pre[current.teamId!] = pre[current.teamId!] || [];
    pre[current.teamId!].push(current);
    return pre;
  }, {});
}
