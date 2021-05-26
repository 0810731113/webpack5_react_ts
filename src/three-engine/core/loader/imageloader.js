import {WorkerWrapper} from '../../app/plugins/furniture/worker';
import bimhomeConfig from '../../config/bimhomeconfig'
import {FileStoreHelper as filestorehelper} from '../filestore/filestorehelper';

class ImageLoader {
    static load(imageUrl)
    {
        return new Promise((resolve, reject) => {
            const worker = new WorkerWrapper();
            worker.postMessage({ fileList: [{ path: imageUrl }], credential: bimhomeConfig.DavCredential}, (imageResults) => {
                worker.terminate();
                if (Object.keys(imageResults).length === 0) {
                    console.error('Failed to load the image');
                    reject();
                } else {
                    const blob = new Blob([Object.values(imageResults)[0]]);
                    let localUrl = window.URL.createObjectURL(blob);
                    resolve(localUrl);
                }
            });
        })
    }

    static loadFromFileStore(imageUrl)
    {
        return filestorehelper.DefaultFileStoreHelper.readPathFile(imageUrl)
            .then(res=>
            {
                const blob = new Blob([res]);
                let localUrl = window.URL.createObjectURL(blob);
                return localUrl;
            });
    }
}

export { ImageLoader }