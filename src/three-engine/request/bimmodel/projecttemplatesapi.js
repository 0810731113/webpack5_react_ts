import bimhomeConfig from '../../config/bimhomeconfig';
//import Axios from 'axios';
import { Axios } from '../apicommon';
import { ApiUtils_CheckObj, ApiUtils_CheckArray } from '../apiutils';
import { combineAction, ActionType } from '../../app/ui/data/redux/actionType';


const refreshTemplates = (dispatch) => {

    return projecttemplatesapi.getAllTemplates().then((arr) => {
        dispatch(combineAction(ActionType.SET_TEMPLATES, arr))
    }).catch(() => {
        dispatch(combineAction(ActionType.SET_TEMPLATES, []))
    })
}


const projecttemplatesapi = {

    getAllTemplates() {
        return Axios.get(`${bimhomeConfig.CdgUrl}/project_templates`).then((res) => {
            return ApiUtils_CheckArray(res);
        });
    },

    saveAsTemplate(projectId, name) {
        let body = {
            srcProjectId: projectId,
            templateName: name
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/project_templates`, body);
    },

    deleteTemplate(id) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/project_templates/${id}`);
    }
}


export { refreshTemplates, projecttemplatesapi }