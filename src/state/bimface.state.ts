import { TreeNode, Project, Team, User, VersionVO } from "api/generated/model";
import { find } from "lodash";
import { MutableRefObject } from "react";
import { atom, selectorFamily } from "recoil";

export interface BimfacePageState {
  elementTreeData?: TreeNode[];
  versionList?: VersionVO[];
  bimfaceAppRef?: MutableRefObject<any | null>;
}

const bimfacePageState = atom<BimfacePageState>({
  key: "bimfacePageState",
  default: {
    elementTreeData: undefined,
    versionList: undefined,
    bimfaceAppRef: undefined,
  },
});
export default bimfacePageState;
