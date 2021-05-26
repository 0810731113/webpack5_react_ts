import { decToBin, parseBimfaceId } from "function/number.func";

it("dec2bin", () => {
  const bin = decToBin(7);
  expect(bin).toBe("111");
});

it("parse bimface id", () => {
  const id = parseBimfaceId(523, 7);
  expect(id).toBe("15762598695797259");
});
