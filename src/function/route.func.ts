import {
  decodeDelimitedArray,
  decodeDelimitedNumericArray,
  encodeDelimitedArray,
  encodeDelimitedNumericArray,
  QueryParamConfig,
} from "use-query-params";

/** Uses a comma to delimit entries. e.g. ['a', 'b'] => qp?=a,b */
export const CommaArrayParam: QueryParamConfig<
  string[] | null | undefined,
  (string | null)[] | null | undefined
> = {
  encode: (array: string[] | null | undefined) =>
    encodeDelimitedArray(array, ","),

  decode: (arrayStr: string | (string | null)[] | null | undefined) =>
    decodeDelimitedArray(arrayStr, ","),
};

export const CommaNumberArrayParam: QueryParamConfig<
  number[] | null | undefined,
  (number | null)[] | null | undefined
> = {
  encode: (array: number[] | null | undefined) =>
    encodeDelimitedNumericArray(array, ","),

  decode: (arrayStr: string | (string | null)[] | null | undefined) =>
    decodeDelimitedNumericArray(arrayStr, ","),
};
