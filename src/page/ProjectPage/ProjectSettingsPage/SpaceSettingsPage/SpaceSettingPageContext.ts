import { SpaceTreeNode } from "service/space-settings.service";
import { createContext } from "react";

export interface SpaceSettingPageContext {
  nodes: SpaceTreeNode[];
  addChildNode: (parentId: string) => void;
  addNextNode: (parentId: string) => void;
  modifyNode: (newNode: SpaceTreeNode) => void;
  deleteNode: (id: string) => void;
}

export default createContext<SpaceSettingPageContext>({} as any);
