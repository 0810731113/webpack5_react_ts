import { ProjectRole } from "service/role.service";
import {
  Folder,
  Project,
  ProjectTemplate,
  SpecialtyVO,
  Team,
  User,
  UserVO,
} from "api/generated/model";
import { find } from "lodash";
import { atom, selectorFamily } from "recoil";
import { ResourcePermission } from "api-authorization/generated/model";

export interface ProjectPageState {
  projectId: string;
  project: Project | null;
  folders: Folder[];
  teams: Team[];
  myTeams: Team[] | null;
  users: User[];
  specialties: SpecialtyVO[];
  templates: ProjectTemplate[];
  currentUser: UserVO | null;
  roles: string[];
  resources: ResourcePermission[];
}

const projectPageState = atom<ProjectPageState>({
  key: "projectPageState",
  default: {
    projectId: "",
    project: null,
    folders: [],
    teams: [],
    myTeams: null,
    specialties: [],
    users: [],
    currentUser: null,
    templates: [],
    roles: [],
    resources: [],
  },
});

const folderByIdSelector = selectorFamily({
  key: "folderByIdSelector",
  get: (folderId: string) => ({ get }: any) => {
    const state: ProjectPageState = get(projectPageState);
    return find(state.folders, (folder) => folder.id === folderId);
  },
});

const teamByIdSelector = selectorFamily({
  key: "teamByIdSelector",
  get: (teamId: string) => ({ get }: any) => {
    const state: ProjectPageState = get(projectPageState);
    return find(state.teams, (team) => team.id === teamId);
  },
});

const userByIdSelector = selectorFamily({
  key: "userByIdSelector",
  get: (userId: string) => ({ get }: any) => {
    const state: ProjectPageState = get(projectPageState);
    return find(state.users, (user) => user.id === userId);
  },
});

const specialtyByIdSelector = selectorFamily({
  key: "specialtyByIdSelector",
  get: (specialtyId: string) => ({ get }: any) => {
    const state: ProjectPageState = get(projectPageState);
    return find(state.specialties, (specialty) => specialty.id === specialtyId);
  },
});

export default projectPageState;
export {
  teamByIdSelector,
  userByIdSelector,
  folderByIdSelector,
  specialtyByIdSelector,
};
