import { useState, useCallback, useContext } from "react";
import { DataCode } from "api-bimcode/generated/model";
import {
  classificationService,
  elementFilterService,
  specialtyService,
} from "service";
import useLoading from "hook/use-loading.hook";
import { DataNode } from "antd/lib/tree";
import PanelPageContext from "page/PanelPage/PanelPageContext";
import { ElemFilterVO } from "api/generated/model";

const Code_Classfication = "43111117";
const Code_Beam = "31211900";
const Code_Column = "31310600";
const Code_Floor = "31311800";
const Code_PlateHole = "31313020";
const Code_Wall = "31310300";

const CODE_PIPE = "16303000";
const CODE_PIPEFITTING = "16303500";
const CODE_ACCESSORY = "16302500";

const CODE_SITE = "43311200";
const CODE_BUILDING = "43311400";
const CODE_FLOOR = "43311600";
const CODE_REGION = "43311300";
const CODE_CATEGORY = "43111100";

const SC_DOOR = "31310900";
const SC_WINDOW = "31311200";
const SC_WALL_HOLE = "31313010";

const transDataKey: (keys: string[], item: ElemFilterVO) => string[] = (
  keys,
  item,
) => {
  const newKeys = [...keys, ...(item.children?.reduce(transDataKey, []) || [])];
  if (item.filterCode) {
    newKeys.push(item.filterCode);
  }
  return newKeys;
};

const transDataNode: (
  item: ElemFilterVO,
  index: number,
) => DataCode & DataNode = (item, index) => {
  const key =
    item.filterCode ||
    item.children?.reduce(transDataKey, []).join(",") ||
    index.toString();
  return {
    title: item.filterName,
    key,
    children: item.children?.map(transDataNode),
  };
};

export function useClassificationTree(specialtyId?: string) {
  const { specialties } = useContext(PanelPageContext);
  const specialName = specialties?.find((special) => special.id === specialtyId)
    ?.name;
  const [treeData, setTreeData] = useState<(DataCode & DataNode)[]>([]);
  const getData = useCallback(async () => {
    let data: ElemFilterVO[] = [];
    const categories = await elementFilterService
      .getAllFilterCategories()
      .catch(() => {
        console.error("error in getting allFilterCategories");
        return [];
      });
    const currentCategory = categories.find(
      (category) => category.category === specialName,
    );
    if (currentCategory?.id) {
      data = await elementFilterService
        .getElemFiltersByCategory(currentCategory.id)
        .catch(() => {
          console.error("error in getting elemFilters by Category");
          return [];
        });
    }
    // const data = await classificationService.getClassificationTree(codetype);
    // const data: DataCode[] = [
    //   { title: "梁", code: Code_Beam },
    //   { title: "柱", code: Code_Column },
    //   { title: "板", code: Code_Floor },
    //   { title: "板洞", code: Code_PlateHole },
    //   { title: "墙", code: Code_Wall },
    //   { title: "管道", code: CODE_PIPE },
    //   { title: "管件", code: CODE_PIPEFITTING },
    //   { title: "管路附件", code: CODE_ACCESSORY },
    //   { title: "门", code: SC_DOOR },
    //   { title: "窗", code: SC_WINDOW },
    //   { title: "墙洞", code: SC_WALL_HOLE },
    // ];
    setTreeData([
      {
        key: "all",
        title: "全部",
        children: data.map(transDataNode),
      },
    ]);
  }, [specialtyId, specialties]);
  const { loading } = useLoading(getData, undefined, null);
  return { treeData, refresh: getData, loading };
}
