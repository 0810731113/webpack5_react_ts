import produce from "immer";
import { orderBy } from "lodash";
import { atom, SetterOrUpdater } from "recoil";

export interface AppState {
  breadCrumbs: BreadCrumbItem[];
}

export interface BreadCrumbItem {
  type: string;
  url: string;
  title: string;
  sort?: number;
}

const appState = atom<AppState>({
  key: "appState",
  default: {
    breadCrumbs: [],
  },
});

export function pushBreadCrumb(
  { title, type, url, sort }: BreadCrumbItem,
  setState: SetterOrUpdater<AppState>,
) {
  setState((pre) =>
    produce(pre, (draft) => {
      const bc = draft.breadCrumbs.find((bc) => bc.type === type);
      if (bc) {
        bc.title = title;
        bc.url = url;
      } else {
        draft.breadCrumbs.push({ title, type, url, sort });
        draft.breadCrumbs = orderBy(
          draft.breadCrumbs,
          ["sort", "url"],
          ["asc", "desc"],
        );
      }
    }),
  );
}

export function popBreadCrumb(
  type: string,
  setState: SetterOrUpdater<AppState>,
) {
  setState((pre) =>
    produce(pre, (draft) => {
      draft.breadCrumbs = draft.breadCrumbs.filter((bc) => bc.type !== type);
    }),
  );
}

export default appState;
