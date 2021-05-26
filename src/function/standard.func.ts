import {
  StandardPropertyDTOValueTypeEnum,
  StandardPropertyDTO,
} from "api/generated/model";

export const PORPORTYPE_CODE = Object.freeze({
  buildingType: "43511101",
  structureType: "43511301",
  buildingEnterprise: "41111151",
  designEnterprise: "41111152",
});

export function formStandardCodeObj(code: string, value: string) {
  return {
    propertyId: code,
    stringValue: value ?? "",
    valueType: StandardPropertyDTOValueTypeEnum.String,
  };
}

export function extractDataFromStandardObj(
  names: Array<
    "buildingType" | "structureType" | "buildingEnterprise" | "designEnterprise"
  >,
  obj: Array<StandardPropertyDTO>,
) {
  if (!obj) {
    return null;
  }

  const rtObj: any = {};

  names.forEach((name) => {
    if (!PORPORTYPE_CODE?.[name]) {
      rtObj[name] = null;
    } else {
      rtObj[name] = obj.find(
        (prop) => prop.propertyId === PORPORTYPE_CODE[name],
      )?.stringValue;
    }
  });

  return rtObj;
}
