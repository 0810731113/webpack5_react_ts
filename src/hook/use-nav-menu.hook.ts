import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import { useContext, useEffect } from "react";

export default function useNavMenu(key: string) {
  const { setSelectedMenuKey } = useContext(ProjectPageContext);
  useEffect(() => {
    setSelectedMenuKey(key);
  }, []);
}
