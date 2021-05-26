import { SpaceTreeNode } from "service/space-settings.service";
import { Draft } from "immer";
import { SpaceSettingsPageState } from "page/ProjectPage/ProjectSettingsPage/SpaceSettingsPage/SpaceSettingsPage";
import { uuidv4 } from "./string.func";

// const uuid = (level: number) => {
//   return "uuid-" + new Date().getTime() + "-" + level;
// };

const SPACETYPES = ["Site", "Building", "Region", "Floor"];
const NAMES = ["未命名场地", "未命名楼栋", "未命名区域", "未命名楼层"];

const createDefaultChilds = (level: number, name: string) => {
  const newNode: SpaceTreeNode = {
    id: uuidv4(),
    spaceName: name,
    spaceType: SPACETYPES[level],
    spaceDescription: "",
  };
  if (level === 3) {
    newNode.attachValues!.ArchitectureLevel = "0.000";
    newNode.attachValues!.StructureLevel = "-0.050";
  }

  let tmp = newNode;
  while (level < SPACETYPES.length - 1) {
    level++;
    const child: SpaceTreeNode = {
      id: uuidv4(),
      spaceName: NAMES[level],
      spaceType: SPACETYPES[level],
      spaceDescription: "",
    };
    if (level === 3) {
      child.attachValues = {
        ArchitectureLevel: "0.000",
        StructureLevel: "-0.050",
      };
    }

    tmp.subSpaces = [child];
    tmp = child;
  }
  return newNode;
};

// export const findSpaceNodeById = (id: string, allNodes: SpaceTreeNode[]) => {
//   let stack = new Array();
//   let result = null;
//   stack.push(...allNodes);

//   while (stack.length > 0) {
//     let node = stack.pop();
//     if (node.id === id) {
//       result = node;
//       break;
//     }
//     if (node.subSpaces instanceof Array && node.subSpaces.length > 0) {
//       stack.push(...node.subSpaces);
//     }node
//   }

//   return result;
// };

export const generateDefaultSpaceData = () => {
  const data = createDefaultChilds(0, NAMES[0]);
  return [data];
};

export interface SpaceSearchResult {
  node: SpaceTreeNode;
  level: number;
  isOnlyChild: boolean;
  parentId: string;
}

const findSpaceNodeRecursion = (
  id: string,
  nodes: SpaceTreeNode[],
  lvl: number,
  parentId: string,
): SpaceSearchResult | null => {
  let thisNode = null;

  for (let index = 0; index < nodes.length; index++) {
    if (nodes[index].id === id) {
      thisNode = {
        node: nodes[index],
        level: lvl,
        isOnlyChild: nodes.length === 1,
        parentId,
      };
      break;
    }

    thisNode = findSpaceNodeRecursion(
      id,
      nodes[index].subSpaces ?? [],
      lvl + 1,
      nodes[index].id,
    );

    if (thisNode) {
      break;
    }
  }
  return thisNode;
};

export const findSpaceNodeById = (
  id: string,
  { nodes }: Draft<SpaceSettingsPageState>,
): SpaceSearchResult => findSpaceNodeRecursion(id, nodes, 0, "Root")!;

export const modifySpaceNode = (
  obj: SpaceTreeNode,
  draft: Draft<SpaceSettingsPageState>,
) => {
  const thisNode = findSpaceNodeById(obj.id, draft);
  const { node } = thisNode;
  if (obj.spaceName) node.spaceName = obj.spaceName;
  if (obj.spaceDescription) node.spaceDescription = obj.spaceDescription;
  if (obj.subSpaces) node.subSpaces = obj.subSpaces;
  return { ...thisNode, node: { ...thisNode.node, ...obj } };
};

export const addChildSpaceNode = (
  parentId: string,
  draft: Draft<SpaceSettingsPageState>,
): string => {
  const { nodes: allNodes } = draft;
  let newId = "";

  if (parentId === "Root") {
    const newNode = createDefaultChilds(0, NAMES[0]);
    allNodes.push(newNode);
    newId = newNode.id;
  } else {
    const { node: parentNode, level: parentLevel } = findSpaceNodeById(
      parentId,
      draft,
    );
    if (parentNode.subSpaces instanceof Array) {
      const newNode = createDefaultChilds(
        parentLevel + 1,
        NAMES[parentLevel + 1],
      );
      parentNode.subSpaces.push(newNode);
      newId = newNode.id;
    }
  }
  return newId;
};

export const addNextSpaceNode = (
  id: string,
  draft: Draft<SpaceSettingsPageState>,
): string => {
  const { nodes: allNodes } = draft;
  const { parentId } = findSpaceNodeById(id, draft);
  let newId = "";
  if (parentId === "Root") {
    const newNode = createDefaultChilds(0, NAMES[0]);
    allNodes.push(newNode);
    newId = newNode.id;
  } else {
    const { node: parentNode, level: parentLevel } = findSpaceNodeById(
      parentId,
      draft,
    );
    if (parentNode.subSpaces instanceof Array) {
      const newNode = createDefaultChilds(
        parentLevel + 1,
        NAMES[parentLevel + 1],
      );
      parentNode.subSpaces.push(newNode);
      newId = newNode.id;
    }
  }
  return newId;
};

export const deleteSpaceNode = (
  id: string,
  draft: Draft<SpaceSettingsPageState>,
) => {
  const { parentId } = findSpaceNodeById(id, draft);
  const { nodes: allNodes } = draft;

  if (parentId === "Root") {
    const index = allNodes.findIndex((ele: SpaceTreeNode) => ele.id === id);
    allNodes.splice(index, 1);
  } else {
    const { node: parentNode } = findSpaceNodeById(parentId, draft);
    const index = parentNode.subSpaces!.findIndex(
      (ele: SpaceTreeNode) => ele.id === id,
    );
    parentNode.subSpaces!.splice(index, 1);
  }
};

const doCheck = (nodes: SpaceTreeNode[], keyName: "spaceName") => {
  const hash: any = {};
  let bol = false;
  for (const ele of nodes) {
    if (hash[ele[keyName]]) {
      bol = true;
    }
    hash[ele[keyName]] = true;
  }
  return bol;
};

export const checkDuplicateName = (allNodes: SpaceTreeNode[]) => {
  const stack = new Array();

  let hasDuplicate = false;

  if (doCheck(allNodes, "spaceName")) {
    hasDuplicate = true;
  } else {
    stack.push(...allNodes);
  }

  while (stack.length > 0) {
    const node = stack.pop();
    const children = node.subSpaces;

    if (children instanceof Array && children.length > 0) {
      if (doCheck(children, "spaceName")) {
        hasDuplicate = true;
        break;
      }

      stack.push(...children);
    }
  }

  return hasDuplicate;
};
