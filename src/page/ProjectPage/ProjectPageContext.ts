import { createContext } from "react";
import { AxiosError } from "axios";

export interface ProjectPageContext {
  setSelectedMenuKey: (key: string) => void;
  onUserNotFound: (id: string) => void;
  onTeamNotFound: (id: string) => void;

  onResponseError: (error: AxiosError) => void;
}

export default createContext<ProjectPageContext>({} as any);
