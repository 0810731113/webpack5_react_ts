import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { uuid } from '../../app/ui/utils/common';

const SPACETYPES = ['Site', 'Building', 'Region', 'Floor'];
const NAMES = ['未命名场地', '未命名楼栋', '未命名区域', '未命名楼层'];

const createDefaultChilds = (lvl, name) => {
    let newNode = {
        id: uuid(lvl),
        spaceName: name,
        spaceType: SPACETYPES[lvl],
    }
    if (lvl === 3) {
        newNode.spaceValue = '0.000';
    }

    let tmp = newNode;
    while (lvl < SPACETYPES.length - 1) {
        lvl++
        let child = {
            id: uuid(lvl),
            spaceName: NAMES[lvl],
            spaceType: SPACETYPES[lvl],
        }
        if (lvl === 3) {
            child.spaceValue = '0.000';
        }

        tmp.subSpaces = [child]
        tmp = child;

    }
    return newNode;
}

const doCheck = (arr, keyName) => {
    let hash = {};
    let bol = false;
    for (let ele of arr) {
        if (hash[ele[keyName]]) {
            bol = true;
        }
        hash[ele[keyName]] = true
    }
    return bol
}

const spaceapi = {
    data: [],

    getData() {
        let rootNode = {
            spaceName: '空间层级结构树',
            id: 'Root',
            subSpaces: this.data
        }

        return JSON.parse(JSON.stringify([rootNode]))
    },

    checkDuplicateName() {
        let stack = new Array();

        let hasDuplicate = false;

        if (doCheck(this.data, 'spaceName')) {
            hasDuplicate = true
        } else {
            stack.push(...this.data);
        }

        while (stack.length > 0) {
            let node = stack.pop();
            let children = node.subSpaces;

            if (children instanceof Array && children.length > 0) {

                if (doCheck(children, 'spaceName')) {
                    hasDuplicate = true;
                    break;
                }

                stack.push(...children);
            }
        }

        return hasDuplicate;
    },

    findItemById(id) {

        let stack = new Array();
        let result = null;
        stack.push(...this.data);

        while (stack.length > 0) {
            let node = stack.pop();
            if (node.id === id) {
                result = node;
                break;
            }
            if (node.subSpaces instanceof Array && node.subSpaces.length > 0) {
                stack.push(...node.subSpaces);
            }
        }

        return result;
    },

    addChild(id, lvl) {
        if (id === 'Root') {
            this.data.push(createDefaultChilds(lvl, NAMES[lvl]))
        } else {
            let node = this.findItemById(id);
            if (node.subSpaces instanceof Array) {
                node.subSpaces.push(createDefaultChilds(lvl, NAMES[lvl]));
            }
        }
    },

    modifyNode(id, obj) {
        let node = this.findItemById(id);
        if (obj.spaceName) node.spaceName = obj.spaceName;
        if (obj.spaceDescription) node.spaceDescription = obj.spaceDescription;
        if (obj.spaceValue) node.spaceValue = obj.spaceValue;
    },

    deleteNode(parentId, id) {
        if (parentId === 'Root') {
            let index = this.data.findIndex((ele) => ele.id === id);
            this.data.splice(index, 1);
        } else {
            let parentNode = parentId ? this.findItemById(parentId) : this.data;
            let index = parentNode.subSpaces.findIndex((ele) => ele.id === id);
            parentNode.subSpaces.splice(index, 1);
        }
    },

    getSpaceConfigByProjectId(projectId) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/config/scope/Project/${projectId}/type/SpaceConfig`).then((res) => {
            //return Axios.get(`${bimhomeConfig.CdgUrl}/config/scope/Project/${projectId}/type/SpaceConfig`).then((res) => {

            if (res && res.data && res.data.configValue) {
                let obj = res.data.configValue;

                //ID, SpaceName, SpaceType, SubSpaces, SpaceValue
                //此处两份JSON.parse，相当于深拷贝
                this.data = JSON.parse(obj);
                return this.getData();
            } else {
                return {}
            }
        });
    },

    modifySpaceConfig(projectId) {

        return Axios.post(`${bimhomeConfig.CdgUrl}/config/scope/Project/${projectId}/type/SpaceConfig`, this.data)
    }

}

export { spaceapi }