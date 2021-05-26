import { Decimal } from "decimal.js";

export const plus = (a: number, b: number) => {
  const x = new Decimal(a);
  const y = new Decimal(b);
  const z = x.plus(y);
  return z.toNumber();
};

export const minus = (a: number, b: number) => {
  const x = new Decimal(a);
  const y = new Decimal(b);
  const z = x.minus(y);
  return z.toNumber();
};

export const multiply = (a: number, b: number) => {
  const x = new Decimal(a);
  const y = new Decimal(b);
  const z = x.times(y);
  return z.toNumber();
};

export const divide = (a: number, b: number) => {
  const x = new Decimal(a);
  const y = new Decimal(b);
  const z = x.div(y);
  return z.toNumber();
};
