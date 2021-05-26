import { AxisGroup } from "three-engine/bim/model/objects/axisgroup";
import { AxisGridCustomized } from "three-engine/bim/model/objects/axisgridcustomized";

export interface InstanceAxis {
  dist: number;
  num: number;
  name: string;
  pointer: any;
}

export interface AxisGridData {
  sumX: number;
  sumY: number;
  arrX: InstanceAxis[];
  arrY: InstanceAxis[];
}

// const fromNumToDistance = (arr: InstanceAxis[]) => {
//   if (arr.length > 0) {
//     if (arr[0].num > 1) {
//       arr[0].num--;
//     } else {
//       arr.shift();
//     }
//   }
// };

export const toUIAxisData = (data: AxisGridCustomized): AxisGridData => {
  const sumX = data._sumX;
  const sumY = data._sumY;

  const arrX = [];
  const arrY = [];

  for (let p: AxisGroup = data._X; p; p = p.next) {
    arrX.push({
      dist: p.dist,
      num: p.num,
      name: p.entities[0]?.name,
      pointer: p,
    });
  }
  for (let p: AxisGroup = data._Y; p; p = p.next) {
    arrY.push({
      dist: p.dist,
      num: p.num,
      name: p.entities[0]?.name,
      pointer: p,
    });
  }

  // fromNumToDistance(arrX);
  // fromNumToDistance(arrY);

  return { sumX, sumY, arrX: arrX.reverse(), arrY: arrY.reverse() };
};

export const GridAngle = {
  value: 0,
  setVal(val: number) {
    this.value = val;
  },
};

interface gridInstance {
  name: string;
}
export const checkEmptyGridName = (data: gridInstance[]) => {
  if (!(data instanceof Array)) {
    return true;
  }
  let rt = false;

  for (const ele of data) {
    if (!ele.name) {
      rt = true;
      break;
    }
  }
  return rt;
};

export const checkDuplicateGridName = (data: gridInstance[]) => {
  if (!(data instanceof Array)) {
    return true;
  }

  const orgArr = data.map((el) => el.name);

  const newArr = orgArr.reduce<string[]>(
    (prev, cur) => (prev.includes(cur) ? prev : [...prev, cur]),
    [],
  );

  return newArr.length !== orgArr.length;
};
