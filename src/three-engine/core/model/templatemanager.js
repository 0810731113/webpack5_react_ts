import Entity from './entity';
import { entityTypes } from './entitytypes';
import { Template } from '../../core/template/template';

class TemplateManager extends Entity {
    constructor() {
        super(entityTypes.TemplateManager);
        this._templates = [];
    }

    lookup(entityId) {
        let template = null;
        for (let i = 0; i < this._templates.length; i++) {
            let temp = this._templates[i];
            if (temp.entityId == entityId) {
                template = temp;
                break;
            }
        }

        return template;
    }

    lookupUsingName(name) {
        let template = null;
        for (let i = 0; i < this._templates.length; i++) {
            let temp = this._templates[i];
            if (name && temp.name == name) {
                template = temp;
                break;
            }
        }

        return template;
    }

    addTemplate(template)
    {
        if(this.lookup(template.entityId) == null)
        {
            this._templates.push(template);
            this.stageChange();
        }
    }

    // serializedData() {
    //     let obj = super.serializedData();
    //     return Object.assign(obj, {
    //         templates: this._templates
    //     });
    // }

    serializedMetaData() {
        return {
            className: 'TemplateManager',
            schemaVersion: 0
        };
    }
    
    static make() {
        let mgr = new TemplateManager();
        // mgr._templates = data.templates;
        return mgr;
    }

    // onFixLink(entityMap) {
    //     super.onFixLink(entityMap);
    //     let templates = this._templates;
    //     this._templates = [];
    //     templates.forEach(itr => {
    //         let template = entityMap.get(itr);
    //         this._templates.push(template);
    //     });
    // }

    // onLinkedEntities() {
    //     return super.onLinkedEntities();
    //     let arr = super.onLinkedEntities();
    //     arr.push(...this._templates);
    //     return arr;
    // }
}

export { TemplateManager }