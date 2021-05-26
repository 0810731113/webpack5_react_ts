import { divide, padEnd, padStart, ceil } from "lodash";
import Long from "long";

export function parseBimfaceId(elementId: number, subId: number) {
  elementId = parseInt(padStart(decToBin(elementId), 32, "0"), 2);
  subId = parseInt(padEnd(padStart(decToBin(subId), 13, "0"), 32, "0"), 2);
  return Long.fromBits(elementId, subId).toString();
}

export function decToBin(dec: number) {
  return (dec >>> 0).toString(2);
}
export function formatByte(B: number) {
  if (B === 0) {
    return "0.0G";
  }
  let result = B;
  let unit = "B";
  if (result > 1024) {
    result = divide(result, 1024);
    unit = "K";
  }
  if (result > 1024) {
    result /= 1024;
    unit = "M";
  } else {
    result = ceil(result, 0);
  }
  if (result > 1024) {
    result /= 1024;
    unit = "G";
  } else {
    result = ceil(result, 1);
  }
  result = ceil(result, 2);
  return `${result}${unit}`;
}
