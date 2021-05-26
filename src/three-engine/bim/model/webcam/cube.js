import * as THREE from 'three'
import { entityTypes } from '../../../core/model/entitytypes';
import { GbmpEntity } from '../../../core/model/gbmpentity';
import DisplayLevel from '../../../core/model/displaylevel';

class Cube extends GbmpEntity {
    constructor() {
        super(entityTypes.Cube);
        this._displayLevel = DisplayLevel.Face;
        this.buildBody(this.meshData.mesh);
    }

    get meshData() {
        return {
            'mesh': {
                'faces': [
                    { 'tag': 1, 'area': 1, 'normal': [0, 0, -1], 'mesh': { 'vertices': [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 'normals': [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], 'uvs': [1, 0, 0, 0, 0, 1, 1, 1], 'triangles': [1, 0, 2, 3, 2, 0] }, 'edges': [{ 'vertices': [-0.5, -0.5, 0, 0.5, -0.5, 0] }, { 'vertices': [0.5, -0.5, 0, 0.5, 0.5, 0] }, { 'vertices': [0.5, 0.5, 0, -0.5, 0.5, 0] }, { 'vertices': [-0.5, 0.5, 0, -0.5, -0.5, 0] }] },
                    { 'tag': 2, 'area': 1, 'normal': [0, 0, 1], 'mesh': { 'vertices': [-0.5, -0.5, 1, 0.5, -0.5, 1, 0.5, 0.5, 1, -0.5, 0.5, 1], 'normals': [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 'uvs': [0, 0, 1, 0, 1, 1, 0, 1], 'triangles': [0, 1, 2, 2, 3, 0] }, 'edges': [{ 'vertices': [-0.5, -0.5, 1, 0.5, -0.5, 1] }, { 'vertices': [0.5, -0.5, 1, 0.5, 0.5, 1] }, { 'vertices': [0.5, 0.5, 1, -0.5, 0.5, 1] }, { 'vertices': [-0.5, 0.5, 1, -0.5, -0.5, 1] }] },
                    { 'tag': 3, 'area': 1, 'normal': [0, -1, 0], 'mesh': { 'vertices': [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, -0.5, 1, -0.5, -0.5, 1], 'normals': [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0], 'uvs': [0, 0, 1, 0, 1, 1, 0, 1], 'triangles': [0, 1, 2, 2, 3, 0] }, 'edges': [{ 'vertices': [-0.5, -0.5, 0, 0.5, -0.5, 0] }, { 'vertices': [0.5, -0.5, 0, 0.5, -0.5, 1] }, { 'vertices': [-0.5, -0.5, 1, 0.5, -0.5, 1] }, { 'vertices': [-0.5, -0.5, 0, -0.5, -0.5, 1] }] },
                    { 'tag': 4, 'area': 1, 'normal': [1, 0, 0], 'mesh': { 'vertices': [0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, 0.5, 1, 0.5, -0.5, 1], 'normals': [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], 'uvs': [0, 0, 1, 0, 1, 1, 0, 1], 'triangles': [0, 1, 2, 2, 3, 0] }, 'edges': [{ 'vertices': [0.5, -0.5, 0, 0.5, 0.5, 0] }, { 'vertices': [0.5, 0.5, 0, 0.5, 0.5, 1] }, { 'vertices': [0.5, -0.5, 1, 0.5, 0.5, 1] }, { 'vertices': [0.5, -0.5, 0, 0.5, -0.5, 1] }] },
                    { 'tag': 5, 'area': 1, 'normal': [0, 1, 0], 'mesh': { 'vertices': [0.5, 0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0.5, 0.5, 1], 'normals': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 'uvs': [0, 0, 1, 0, 1, 1, 0, 1], 'triangles': [0, 1, 2, 2, 3, 0] }, 'edges': [{ 'vertices': [0.5, 0.5, 0, -0.5, 0.5, 0] }, { 'vertices': [-0.5, 0.5, 0, -0.5, 0.5, 1] }, { 'vertices': [0.5, 0.5, 1, -0.5, 0.5, 1] }, { 'vertices': [0.5, 0.5, 0, 0.5, 0.5, 1] }] },
                    { 'tag': 6, 'area': 1, 'normal': [-1, 0, 0], 'mesh': { 'vertices': [-0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, -0.5, 1, -0.5, 0.5, 1], 'normals': [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], 'uvs': [0, 0, 1, 0, 1, 1, 0, 1], 'triangles': [0, 1, 2, 2, 3, 0] }, 'edges': [{ 'vertices': [-0.5, 0.5, 0, -0.5, -0.5, 0] }, { 'vertices': [-0.5, -0.5, 0, -0.5, -0.5, 1] }, { 'vertices': [-0.5, 0.5, 1, -0.5, -0.5, 1] }, { 'vertices': [-0.5, 0.5, 0, -0.5, 0.5, 1] }] }],
                'bottomFaces': [0],
                'topFaces': [1],
                'sideFaces': [2, 3, 4, 5]
            }
        };
    }
}

export { Cube }