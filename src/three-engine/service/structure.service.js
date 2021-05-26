// import React, { useEffect, useState } from 'react';
// import { projectstrucapi } from "../request/structure/projectstrucapi";
// import Iconfont from "../app/ui/utils/Iconfont";


const structureData = {

    mapArrToTree(arr) {

        let map = {};
        let newData = [];

        arr.forEach(node => {
            //if (node.parentId || node.parentId === 0) { 
            //全部 parentId 为 null
            map[node.id] = node;
            node.key = node.id;
            node.title = `${node.name} (${node.count})`;
            //node.switcherIcon = <Iconfont type='bim360_icon_wenjianjia1' />
            //}
        })

        arr.forEach(node => {
            //if (node.parentId || node.parentId === 0) {
            let parent = map[node.parentId];
            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(node)
            } else {
                newData.push(node);
            }
            //}
        });

        return newData

    },

    // async checkSuiteExistInProject(suiteId, projectId) {
    //     let arr = await projectstrucapi.checkSuiteExistInProject(suiteId, projectId);
    //     let item = arr.find((ele) => ele.id === suiteId)
    //     return item ? item.exists : false
    // }

}

export { structureData }