import Axios from "axios";
import consts from "consts";
import { AddInterceptors } from "function/interceptors";
import { ApplyService } from "./apply.service";
import { ArchiveService } from "./archive.service";
import { AuthService } from "./auth.service";
import { BfproxyService } from "./bfproxy.service";
import { ClassificationService } from "./classification.service";
import { ConstructionSettingsService } from "./construction-settings.service";
import ElementFilterService from "./element-filter.service";
import ElementService from "./element.service";
import { EnterpriseService } from "./enterprise.service";
import { FileService } from "./file.service";
import { FolderService } from "./folder.service";
import { GridSettingsService } from "./grid.settings.service";
import { IntegratePackagesService } from "./integrate-package.service";
import { IssueService } from "./issue.service";
import { LoginService } from "./login.service";
import { MessageService } from "./message.service";
import { PackageService } from "./package.service";
import { PermissionService } from "./permission.service";
import { ProjectService } from "./project.service";
import { RoleService } from "./role.service";
import { SpaceSettingsService } from "./space-settings.service";
import { SpecialtyService } from "./specialty.service";
import { StructureService } from "./structure.service";
import { SystemService } from "./system.service";
import { TeamService } from "./team.service";
import { TemplateService } from "./template.service";
import { UserService } from "./user.service";
import { VersionService } from "./version.service";
import { WorkUnitService } from "./work-unit.service";
import { XmonitorService } from "./xmonitor.service";
import { FontService } from "./font.service";

const {
  API_BASE_STRUC_URL,
  API_BASE_URL,
  API_BASE_BIMCODE_URL,
  API_BASE_BIMFACE_URL,
  API_BASE_SYSTEM_URL,
  API_BASE_STORE_URL,
  API_BASE_AUTHORIZATION_URL,
  AUTH_BASE_URL,
} = consts;

const authService = new AuthService();
const projectService = new ProjectService(API_BASE_URL, Axios);
const teamService = new TeamService(API_BASE_URL, Axios);
const folderService = new FolderService(API_BASE_URL, Axios);
const workUnitService = new WorkUnitService(API_BASE_URL, Axios);
const xmonitorService = new XmonitorService(API_BASE_URL, Axios);
const userService = new UserService(API_BASE_URL, Axios);
const packageService = new PackageService(API_BASE_URL, Axios);
const fileService = new FileService(API_BASE_URL, Axios);
const spaceSettingsService = new SpaceSettingsService(API_BASE_URL, Axios);
const gridSettingsService = new GridSettingsService(API_BASE_URL, Axios);
const messageService = new MessageService(API_BASE_URL, Axios);
const specialtyService = new SpecialtyService(API_BASE_URL, Axios);
const templateService = new TemplateService(API_BASE_URL, Axios);
const constructionSettingsService = new ConstructionSettingsService(
  API_BASE_STORE_URL,
  Axios,
);
const structureService = new StructureService(API_BASE_STRUC_URL, Axios);
const fontService = new FontService(API_BASE_STRUC_URL, Axios);
const archiveService = new ArchiveService(API_BASE_URL, Axios);
const integratePackagesService = new IntegratePackagesService(
  API_BASE_URL,
  Axios,
);
const permissionService = new PermissionService(API_BASE_URL, Axios);
const issueService = new IssueService(API_BASE_URL, Axios);
const versionService = new VersionService(API_BASE_URL, Axios.create());
const elementService = new ElementService(API_BASE_URL, Axios);
const classificationService = new ClassificationService(
  API_BASE_BIMCODE_URL,
  Axios,
);
const bfproxyService = new BfproxyService(API_BASE_BIMFACE_URL, Axios);
const systemService = new SystemService(API_BASE_SYSTEM_URL, Axios.create());
const applyService = new ApplyService(AUTH_BASE_URL, Axios.create());
const enterpriseService = new EnterpriseService(AUTH_BASE_URL, Axios.create());
const loginService = new LoginService(AUTH_BASE_URL, Axios.create());
const elementFilterService = new ElementFilterService(API_BASE_URL, Axios);
const roleService = new RoleService(API_BASE_AUTHORIZATION_URL, Axios);

AddInterceptors(Axios);

export {
  authService,
  fontService,
  projectService,
  teamService,
  folderService,
  workUnitService,
  userService,
  packageService,
  fileService,
  spaceSettingsService,
  gridSettingsService,
  messageService,
  specialtyService,
  templateService,
  constructionSettingsService,
  structureService,
  archiveService,
  integratePackagesService,
  permissionService,
  issueService,
  versionService,
  classificationService,
  bfproxyService,
  elementService,
  systemService,
  loginService,
  elementFilterService,
  roleService,
  xmonitorService,
  applyService,
  enterpriseService,
};
