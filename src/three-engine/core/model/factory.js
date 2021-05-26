import { EntityFactory } from '../dbstorage/entityfactory';
import { Body } from './brep/body';
import { Edge } from './brep/edge';
import { Face } from './brep/face';
import { Component } from './component';
import { ComponentInstance } from './componentinstance';
import { Material } from './material';
import { Mesh } from './mesh';
import { InputParameter, OutputParameter, PrimitiveParameter, EntityParameter } from '../template/parameter';
import { Template } from '../template/template';
import { CompositeTemplate } from '../template/compositetemplate'
import { MaterialSet } from './materialset';
import { MaterialTemplate } from '../../design/templates/materialtemplate';
import { MaterialTemplateInstance } from '../../design/templates/materialtemplateinstance';
import { TemplateManager } from './templatemanager'
import { Camera } from './camera';
import ElementParameter from '../elements/parameters/parameter'
import ParameterDefinition from '../elements/parameters/parameterdefinition'
import ParameterValue from '../elements/parameters/parametervalue'
import PrimitiveValue from '../elements/parameters/primitivevalue'
import Vector3fValue from '../elements/parameters/vector3fvalue'
import ElementFamily from '../elements/elementfamily'
import ElementComponent from '../elements/elementcomponent'
import ElementInstance from '../elements/elementinstance'
import { RoomTemplate } from '../../design/templates/roomtemplate';
import { RoomTemplateInstance } from '../../design/templates/roomtemplateinstance';
import { SkirtinglineTemplate } from '../../design/templates/skirtinglinetemplate';
import { SkirtinglineTemplateInstance } from '../../design/templates/skirtinglinetemplateinstance';
import { SkirtingToplineTemplate } from '../../design/templates/skirtingtoplinetemplate';
import { SkirtingToplineTemplateInstance } from '../../design/templates/skirtingtoplinetemplateinstance';
import { FloorTemplate } from '../../design/templates/floortemplate';
import { FloorTemplateInstance } from '../../design/templates/floortemplateinstance';
import { WallFaceTemplate } from '../../design/templates/wallfacetemplate';
import { WallFaceTemplateInstance } from '../../design/templates/wallfacetemplateinstance';
import { CeilingTemplate } from '../../design/templates/ceilingtemplate';
import { CeilingTemplateInstance } from '../../design/templates/ceilingtemplateinstance';


class Factory {
    constructor() {
        
    }

    register() {
        EntityFactory.register('Edge', Edge.make);
        EntityFactory.register('Face', Face.make);
        EntityFactory.register('Body', Body.make);
        EntityFactory.register('Component', Component.make);
        EntityFactory.register('ComponentInstance', ComponentInstance.make);
        EntityFactory.register('Material', Material.make);
        EntityFactory.register('MaterialSet', MaterialSet.make);
        EntityFactory.register('Mesh', Mesh.make);
        EntityFactory.register('Template', Template.make);
        EntityFactory.register('CompositeTemplate', CompositeTemplate.make);
        EntityFactory.register('PrimitiveParameter', PrimitiveParameter.make);
        EntityFactory.register('EntityParameter', EntityParameter.make);
        EntityFactory.register('InputParameter', InputParameter.make);
        EntityFactory.register('OutputParameter', OutputParameter.make);
        EntityFactory.register('MaterialTemplate', MaterialTemplate.make);
        EntityFactory.register('MaterialTemplateInstance', MaterialTemplateInstance.make);
        EntityFactory.register('RoomTemplate', RoomTemplate.make);
        EntityFactory.register('RoomTemplateInstance', RoomTemplateInstance.make);
        EntityFactory.register('SkirtinglineTemplate', SkirtinglineTemplate.make);
        EntityFactory.register('SkirtinglineTemplateInstance', SkirtinglineTemplateInstance.make);
        EntityFactory.register('SkirtingToplineTemplate', SkirtingToplineTemplate.make);
        EntityFactory.register('SkirtingToplineTemplateInstance', SkirtingToplineTemplateInstance.make);
        EntityFactory.register('FloorTemplate', FloorTemplate.make);
        EntityFactory.register('FloorTemplateInstance', FloorTemplateInstance.make);
        EntityFactory.register('CeilingTemplate', CeilingTemplate.make);
        EntityFactory.register('CeilingTemplateInstance', CeilingTemplateInstance.make);
        EntityFactory.register('WallFaceTemplate', WallFaceTemplate.make);
        EntityFactory.register('WallFaceTemplateInstance', WallFaceTemplateInstance.make);
        EntityFactory.register('TemplateManager', TemplateManager.make);
        EntityFactory.register('Camera', Camera.make);

        EntityFactory.register('ElementParameter', ElementParameter.make);
        EntityFactory.register('ParameterDefinition', ParameterDefinition.make);
        EntityFactory.register('ParameterValue', ParameterValue.make);
        EntityFactory.register('PrimitiveValue', PrimitiveValue.make);
        EntityFactory.register('Vector3fValue', Vector3fValue.make);
        EntityFactory.register('ElementFamily', ElementFamily.make);
        EntityFactory.register('ElementComponent', ElementComponent.make);
        EntityFactory.register('ElementInstance', ElementInstance.make);
    }
}

export { Factory }