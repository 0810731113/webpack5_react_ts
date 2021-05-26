import { WorkerWrapper } from './worker';

class MaterialLoader {
    constructor(material) {
        this._worker = new WorkerWrapper();
        this._material = material;
    }

    load(urlInfo)
    {
        if(urlInfo.url== undefined || urlInfo.credential == undefined)
        {
            console.error(`load material for ${this._material} failed. because wrong url info ${urlInfo}`);
            return null;
        }

        let postRequest = this._assemblyToPostRequest(urlInfo);

        const loader = this;
        this._worker.postMessage(postRequest, (results) => {
            this._worker.terminate();
            if (results.length == 0) {
                console.error(`Failed to load material ${this._material} for url ${urlInfo}`);
                return;
            }

            let materialData = JSON.parse( Object.values(results)[0] );
            loader._assingMaterial(urlInfo, materialData);
        });

    }

    _assingMaterial(urlInfo, materialJsonData)
    {
        if(materialJsonData.diffuse_color!=undefined)
        {
            this._material.diffuse = materialJsonData.diffuse_color.split(',');
        }
        if(materialJsonData.specular_color!=undefined)
        {
            this._material.specular = materialJsonData.specular_color.split(',');
        }

        this._material.width = materialJsonData.width;
        this._material.height = materialJsonData.height;

        if(materialJsonData.diffuse_texture!=undefined || materialJsonData.diffuse_texture!=null)
        {
            this._loadTexture(urlInfo, materialJsonData);
        }
        else
        {
            this._material.loaded = true;
        }
    }

    _loadTexture(urlInfo, materialJsonData)
    {
        let textureUrl = urlInfo.url.substr(0,urlInfo.url.lastIndexOf('/')+1) + materialJsonData.diffuse_texture.texture_file +'.png';

        let material = this._material;
        let tempworker = new WorkerWrapper();
        tempworker.postMessage({ fileList: [{ path: textureUrl }], credential: urlInfo.credential }, (textureResults) => {
            tempworker.terminate();
            if(textureResults.length<1)
            {
                console.error(`failed to download texture file ${textureUrl}`);
                return;
            }
            const blob = new Blob([Object.values(textureResults)[0]]);
            let localUrl = window.URL.createObjectURL(blob);
            material.diffuseTextureFile = localUrl;
            material.loadTexture().then(()=>{
                material.loaded = true;
            }).catch(err=>{console.log(err)});
        });
    }

    _assemblyToPostRequest(urlInfo)
    {
        let a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        a.href = urlInfo.url;
        const materialMetaUrl = a.href;
        const fileList = [];
        fileList.push({ path: materialMetaUrl, responseType: 'text' });
        a.remove();

        return { fileList: fileList, credential: urlInfo.credential }
    }
}

export { MaterialLoader }