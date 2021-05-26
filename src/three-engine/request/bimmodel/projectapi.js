import bimhomeConfig from '../../config/bimhomeconfig';
//import Axios from 'axios';
import { Axios } from '../apicommon';
import { folderapi, FOLDERTYPE } from './folderapi';

const ProjectStatus = {
    Suspended: 'Suspended',
    Ongoing: 'Ongoing',
    Completed: 'Completed'
}

const projectapi = {

    getProjectById(pjId) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/project/${pjId}`).then((res) => {
            return res.data
        });
    },

    filterProjects(status) {
        let body = {};
        if (status) {
            body.status = status
        }
        return Axios.post(`${bimhomeConfig.CdgUrl}/projects`, body);

    },

    updateProject(id, name, status, description, thumbnail) {
        let body = {
            id: id,
            name: name,
            status: status,
            description: description,
            thumbnail: thumbnail
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/project/update`, body);

    },

    createProject(pjName, status, description, thumbnail, templateId) {
        let body = {
            name: pjName,
            status: status,
            description: description,
            thumbnail: thumbnail,
            templateId: templateId
        }
        return Axios.put(`${bimhomeConfig.CdgUrl}/project`, body).then((res1) => {

            let pjId = res1.data.id;

            if (!res1.data.templateId) {

                let folder1 = {
                    name: '项目文件',
                    projectId: pjId,
                    parentId: null,
                    folderType: FOLDERTYPE.ProjectFiles
                };

                return folderapi.createFolder(folder1).then((res2) => {

                    // let folder2 = {
                    //     name: '校审归档',
                    //     projectId: pjId,
                    //     parentId: null,
                    //     folderType: FOLDERTYPE.Proofreading
                    // }

                    let pjFileFdId = res2.data.id;
                    let sharedFolder = {
                        name: '项目共享',
                        projectId: pjId,
                        parentId: pjFileFdId,
                        folderType: FOLDERTYPE.ProjectShare
                    }
                    return folderapi.createFolder(sharedFolder).then((res) => folderapi.createSubFolderForTeam(res.data.id, pjId));

                }).then(() => {
                    return pjId;
                })
            } else {
                return pjId
            }


        })
    }

}

export { ProjectStatus, projectapi }