import { FileParser } from './fileparser';
import JSM from '../../core/extension/jsmodeler';
import { WorkerWrapper } from '../../app/plugins/furniture/worker';

class ObjParser extends FileParser {
    constructor(worker, options) {
        super(worker);

        this.type = 'obj';
        this.options = options;
    }

    parse(callback) {
        if (this.options.url === undefined || this.options.url === null) {
            if (callback) {
                console.error('Invalid url of obj file');
                callback();
            }
            return;
        }

        const fileList = [];
        // Convert relative url to absolute url
        let a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        a.href = this.options.url;
        const objUrl = a.href;
        fileList.push({ path: objUrl, responseType: 'text' });
        if (this.options.mtl) {
            a.href = this.options.mtl;
            fileList.push({ path: a.href, responseType: 'text' });
        }
        a.remove();

        const self = this;
        this.worker.postMessage({ fileList: fileList, credential: this.options.credential }, (results) => {
            if (results[objUrl] === undefined || results[objUrl] === null) {
                console.error('Failed to load urls');
                callback();
                return;
            }

            const altTextureUrls = {};
            self.data = JSM.ConvertObjToJsonData(results[objUrl], {
                onFileRequested: (fileName) => {
                    const originalFileName = fileName;
                    // File name may contain './'. e.g. "./building.obj.mtl"
                    let index = fileName.lastIndexOf('/');
                    if (index === -1) {
                        index = fileName.lastIndexOf('\\');
                    }
                    if (index !== -1) {
                        fileName = fileName.slice(index + 1);
                    }
                    const encodedFileName = encodeURIComponent(fileName);
                    for (const key in results) {
                        if (key.lastIndexOf(encodedFileName) !== -1) {
                            return results[key];
                        }
                    }
                     
                    if (typeof self.options.textures === 'string') {
                        // Textures may be too many, their root path is given as argument.
                        altTextureUrls[originalFileName] = self.options.textures + encodedFileName;
                        return self.options.textures + fileName;
                    } else if (self.options.textures instanceof Array) {
                        for (let i = 0; i < self.options.textures.length; ++i) {
                            const textureUrl = self.options.textures[i];
                            if (textureUrl.lastIndexOf(encodedFileName) !== -1) {
                                altTextureUrls[fileName] = textureUrl;
                                return textureUrl;
                            }
                        }
                    }
                    console.error(`Path for "${fileName}" was not specified.`);
                    return null;                   
                }
            });

            self.calculateBoundingBox();
            results = {};
            if (self.options.credential && Object.keys(altTextureUrls).length > 0) {
                // In some cases, texture cannot be used directly if it asks the credential e.g. user name and password.
                // We have to download them firstly with the credential and create local urls to use.
                const promiseList = [];
                a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                for (const fileName in altTextureUrls) {           
                    a.href = altTextureUrls[fileName];
                    altTextureUrls[fileName] = a.href;
                    promiseList.push(new Promise((resolve, reject) => {
                        const worker = new WorkerWrapper();
                        worker.postMessage({ fileList: [{ path: a.href }], credential: self.options.credential }, (textureResults) => {
                            worker.terminate();
                            if (Object.keys(textureResults).length === 0) {
                                console.error('Failed to load textures');
                                reject();
                            } else {
                                resolve(textureResults);
                            }
                        });
                    }));
                }
                a.remove();

                Promise.all(promiseList)
                    .then((allResults) => {
                        if (allResults.length === 0) {
                            console.error('Failed to load textures');
                            callback();
                            return;
                        }

                        let textureResults = {};
                        for (const item of allResults) {
                            for (const key in item) {
                                textureResults[key] = item[key];
                            }
                        }
                        allResults = [];

                        for (const fileName in altTextureUrls) {           
                            const originalUrl = altTextureUrls[fileName];
                            if (originalUrl in textureResults) {
                                const blob = new Blob([textureResults[originalUrl]]);
                                altTextureUrls[fileName] = window.URL.createObjectURL(blob);
                            }
                        }

                        textureResults = {};
                        self.data['altTextureUrls'] = altTextureUrls;
                        callback();
                    })
                    .catch((err) => {
                        console.error(err);
                        callback();
                    });
            } else {
                callback();
            }
        });
    }
}

export { ObjParser };