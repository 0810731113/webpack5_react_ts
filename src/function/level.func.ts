import { orderBy } from "lodash";
import { SpaceTreeNode } from "service/space-settings.service";
import { plus, minus, multiply, divide } from "./decimal.func";
import { uuidv4 } from "./string.func";

export interface InstanceLevel {
  id: string;
  name: string;
  arcLevel: number;
  floorHeight: number;
  floorThickness: number;
  strucLevel: number;
}

export type InstanceLevelName =
  | "name"
  | "arcLevel"
  | "floorHeight"
  | "floorThickness"
  | "strucLevel";

// export type LevelData =
//   | { name: "name"; value: string }
//   | { name: "arcLevel"; value: number }
//   | { name: "floorHeight"; value: number }
//   | { name: "floorThickness"; value: number }
//   | { name: "strucLevel"; value: number };

export const newParseFloat = (val: string | undefined) => {
  const num = val ? parseFloat(val) : 0;
  return num;
};

export const toLevelData = (origin: SpaceTreeNode[]) => {
  let data: InstanceLevel[] = origin.map((node) => ({
      id: node.id,
      name: node.spaceName,
      arcLevel: newParseFloat(node.attachValues?.ArchitectureLevel),
      strucLevel: newParseFloat(node.attachValues?.StructureLevel),
      floorHeight: 0,
      floorThickness: 0,
    }));
  data = orderBy(data, "arcHeight");

  for (let i: number = 0; i < data.length; i++) {
    let floorHeight; let floorThickness;
    if (i === data.length - 1) {
      floorHeight = data.length - 1 > 0 ? data[data.length - 2].floorHeight : 3; // 最后一层处理，最高层取上一层的值，没有默认为3
    } else {
      floorHeight = minus(data[i + 1].arcLevel, data[i].arcLevel);
    }

    floorThickness = multiply(
      minus(data[i].arcLevel, data[i].strucLevel),
      1000,
    );

    data[i].floorHeight = floorHeight;
    data[i].floorThickness = floorThickness;
  }

  return data;
};

export const deserialize = (data: InstanceLevel[]) => {
  const apiData: SpaceTreeNode[] = data.map((level) => ({
      id: level.id,
      spaceName: level.name,
      spaceDescription: "",
      spaceType: "Floor",
      attachValues: {
        ArchitectureLevel: level.arcLevel.toFixed(3),
        StructureLevel: level.strucLevel.toFixed(3),
      },
    }));

  return apiData;
};

const updateUpperLevel = (
  data: InstanceLevel[],
  index: number,
  arcLevel: number,
) => {
  const totalLevel = data.length;
  const startLevel = index;
  let sum = arcLevel;

  for (let i = startLevel; i < totalLevel; i++) {
    data[i].arcLevel = sum;
    data[i].strucLevel = minus(sum, divide(data[i].floorThickness, 1000));
    sum = plus(sum, data[i].floorHeight);

    if (i === totalLevel - 1) {
      data[i].floorHeight =
        totalLevel - 1 > 0 ? data[totalLevel - 2].floorHeight : 3; // 最后一层处理，最高层取上一层的值，没有默认为3
    }
  }
};

export const calcLevel = (
  data: InstanceLevel[],
  index: number,
  name: InstanceLevelName,
  value: number,
) => {
  switch (name) {
    case "floorThickness": {
      data[index].strucLevel = minus(data[index].arcLevel, divide(value, 1000));
      break;
    }
    case "strucLevel": {
      data[index].floorThickness = multiply(
        minus(data[index].arcLevel, value),
        1000,
      );
      break;
    }

    case "arcLevel": {
      if (index > 0) {
        data[index - 1].floorHeight = minus(value, data[index - 1].arcLevel);
      }
      updateUpperLevel(data, index, value);
      break;
    }

    case "floorHeight": {
      const nextArcLevel = plus(data[index].arcLevel, value);
      updateUpperLevel(data, index + 1, nextArcLevel);

      break;
    }
  }
};

export const addLowerLevel = (
  data: InstanceLevel[],
  index: number,
  newName: number,
) => {
  let newLine: InstanceLevel;
  if (index === 0) {
    newLine = {
      id: uuidv4(),
      name: `${newName}F`,
      arcLevel: minus(data[index].arcLevel, data[index].floorHeight),
      floorHeight: data[index].floorHeight,
      floorThickness: data[index].floorThickness,
      strucLevel: 0,
    };
  } else {
    newLine = {
      id: uuidv4(),
      name: `${newName}F`,
      arcLevel: data[index].arcLevel,
      floorHeight: data[index].floorHeight,
      floorThickness: data[index].floorThickness,
      strucLevel: 0,
    };
  }

  data.splice(index, 0, newLine);

  updateUpperLevel(data, index, data[index].arcLevel);
};

export const batchAddUpperLevel = (
  data: InstanceLevel[],
  floorHeight: number,
  floorThickness: number,
  count: number,
  newName: number,
) => {
  const lastIndex = data.length - 1;

  if (lastIndex >= 0) {
    data[lastIndex].floorHeight = floorHeight;
  }

  while (count > 0) {
    newName++;
    const newLine: InstanceLevel = {
      id: uuidv4(),
      name: `${newName}F`,
      arcLevel: data[lastIndex].arcLevel,
      floorHeight,
      floorThickness,
      strucLevel: 0,
    };
    count--;
    data.push(newLine);
  }

  updateUpperLevel(data, lastIndex, data[lastIndex].arcLevel);
};

export const addUpperLevel = (
  data: InstanceLevel[],
  index: number,
  newName: number,
) => {
  const newLine: InstanceLevel = {
    id: uuidv4(),
    name: `${newName}F`,
    arcLevel: data[index].arcLevel,
    floorHeight: data[index].floorHeight,
    floorThickness: data[index].floorThickness,
    strucLevel: 0,
  };

  data.splice(index + 1, 0, newLine);

  updateUpperLevel(data, index, data[index].arcLevel);
};

export const deleteLevel = (data: InstanceLevel[], index: number) => {
  data.splice(index, 1);
  // 删完后 data.length减一了
  if (index < data.length && index > 0) {
    updateUpperLevel(data, index - 1, data[index - 1].arcLevel);
  }
};
