import { useRequest } from "@umijs/hooks";
import { elementService, versionService } from "service";
import { useEffect } from "react";
import { ResponseCollectionElement, Element } from "api/generated/model";

interface ElementEx extends Element {
  bfId?: string;
}
enum incrementType {
  ADDED = "ADDED",
  MODIFIED = "MODIFIED",
  DELETED = "DELETED",
}
export const getBfElementId = (subId?: string, rawId?: string) => 
  // var subIdstr = Number(subId).toString(2);
  // var rawIdstr = Number(rawId).toString(2);
  // //高16位，低51位
  // var subStr = '0';
  // subStr = subStr.repeat(16 - subIdstr.length);
  // var rawStr = '0';
  // rawStr = rawStr.repeat(48 - rawIdstr.length);
  // var result = subStr + subIdstr + rawStr + rawIdstr;
  // //return parseInt(result,2);
  // return Long.fromString(result, 2).toString();
   "12345678"
;

const handleIncrementElement = (
  incrementElements: Element[],
  preVersionElements: Element[],
  subId?: string,
) => {
  const preElements = new Map<string, ElementEx>();
  preVersionElements.forEach((preVersionElement) => {
    if (
      preVersionElement.typeMeta === "Instance" &&
      preVersionElement.mesh != "[]"
    ) {
      preElements.set(preVersionElement.id!, preVersionElement);
    }
  });
  // 按照增量类型(增加的，修改的，删除的)存放增量构件
  const differenceMap = new Map<string, ElementEx[]>();
  differenceMap.set(incrementType.ADDED, new Array());
  differenceMap.set(incrementType.MODIFIED, new Array());
  differenceMap.set(incrementType.DELETED, new Array());

  incrementElements.forEach((incrementElement) => {
    const newElement: ElementEx = { ...incrementElement };
    const element = preElements.get(incrementElement.id!);
    if (newElement.typeMeta === "Instance" && newElement.mesh != "[]") {
      const type =
        element == null ? incrementType.ADDED : incrementType.MODIFIED;
      newElement.name = newElement.name ?? "未命名";

      newElement.bfId = getBfElementId(subId, newElement.id);
      differenceMap.get(type)?.push(newElement);
    } else if (element != null && newElement.deleted) {
      element.name = element.name == null ? "未命名" : element.name;

      element.bfId = getBfElementId(subId, element.id);
      differenceMap.get(incrementType.DELETED)?.push(element);
    }
  });

  return differenceMap;
};
export const useCompareElements = (
  leftVersionId: number,
  rightVersionId?: number,
) => {
  const { data, loading, run } = useRequest(
    async () => {
      if (leftVersionId && rightVersionId) {
        const [leftVersion, rightVersion] =
          (await versionService.listVersionsByIds([
            leftVersionId,
            rightVersionId,
          ])) || [];
        const incrementData = await versionService.listIncrementElements(
          leftVersion.dataSetId!,
          rightVersion?.version!,
          leftVersion?.version!,
        );
        return incrementData;
      }
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [leftVersionId, rightVersionId]);

  return {
    compareElements: data,
    loading,
    run,
  };
};
