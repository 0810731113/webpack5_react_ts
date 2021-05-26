import { useEffect } from "react";
import { useRecoilState } from "recoil";
import appState, { popBreadCrumb, pushBreadCrumb } from "state/app.state";

export default function useBreadCrumbs(
  title: string,
  type: string,
  url: string,
  sort?: number,
) {
  const [{ breadCrumbs }, setAppState] = useRecoilState(appState);
  useEffect(() => {
    if (title) {
      pushBreadCrumb({ title, type, url, sort }, setAppState);
    }
  }, [title, url]);

  useEffect(() => () => {
      popBreadCrumb(type, setAppState);
    }, []);

  return { breadCrumbs };
}
