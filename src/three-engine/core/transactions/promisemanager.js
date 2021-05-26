import ComputeEngine from '../compute/engine';

class PromiseManager {
    constructor() {
        this._promises = [];
    }

    addPromise(promise) {
        if (!promise) {
            return;
        }

        this._promises.push(promise);
    }

    clear() {
        this._promises = [];
    }

    isEmpty() {
        return this._promises.length == 0;
    }

    done(){
        const promises = [];
        let allSucceeded = true;
        this._promises.forEach(pro => {
            promises.push(pro.catch(error => {
                allSucceeded = false;
                return error;
            }));
        });
        this.clear();
        return new Promise((resolve, reject) => {
            Promise.all(promises).then((results) => {
                ComputeEngine.instance().execute();
                if(!ComputeEngine.instance().done() || this._promises.length > 0) {
                    this.done().then(() => {
                        if (allSucceeded) {
                            resolve();
                        } else {
                            reject();
                        }
                    }).catch(() => {
                        reject();
                    });
                } else {
                    if (!allSucceeded) {
                        reject();
                    } else {
                        resolve();
                    }
                }
            }).catch(reject);
        })
    }
}

export { PromiseManager }