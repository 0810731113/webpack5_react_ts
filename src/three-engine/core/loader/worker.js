// onmessage = function(event) {
//     openFile(event.data);
// };

// openFile = function(data) {
//     if (data === undefined || data.fileList === undefined || data.fileList === null || data.fileList.length <= 0) {
//         return;
//     }

//     var result = {};
//     for (var i = 0; i < data.fileList.length; ++i) {
//         var file = data.fileList[i];
//         if (file && file.path) {
//             var req = new XMLHttpRequest();
//             req.open("GET", file.path, false);
//             if (data.credential) {
//                 req.setRequestHeader("Authorization", "Basic " + btoa(data.credential));
//             }
//             req.responseType = (file.responseType ? file.responseType : "arraybuffer");
//             req.send();
//             if (req.readyState === 4) {
//                 result[file.path] = req.response.slice(0);
//             }
//         }
//     }
//     postMessage(result);
// };

const workerScript = 
'onmessage = function(event) { openFile(event.data); };' +
'openFile = function(data) {' +
'if (data === undefined || data.fileList === undefined || data.fileList === null || data.fileList.length <= 0) { return; }' +
'var result = {};' +
'for (var i = 0; i < data.fileList.length; ++i) {' +
'var file = data.fileList[i];' +
'if (file && file.path) {' +
'var req = new XMLHttpRequest();' +
'req.open("GET", file.path, false);' +
'if (data.credential) { req.setRequestHeader("Authorization", "Basic " + btoa(data.credential)); }' +
'req.responseType = (file.responseType ? file.responseType : "arraybuffer");' +
'req.send();' +
'if (req.readyState === 4) {' +
'result[file.path] = req.response.slice(0);' +
'}}}' +
'postMessage(result);' +
'};';

class WorkerWrapper {
    constructor() {
        this.messages = [];
        this.wip = false;   
    }

    init() {
        if (this.worker === undefined) {
            const blob = new Blob([workerScript]);
            this.blobURL = window.URL.createObjectURL(blob);
            this.worker = new Worker(this.blobURL);
        }
    }

    terminate() {
        this.messages = [];

        if (this.worker) {
            this.worker.terminate();
            this.worker = undefined;
        }

        if (this.blobURL) {
            window.URL.revokeObjectURL(this.blobURL);
            this.blobURL = undefined;
        }
    }

    postMessage(data, callback) {
        if (this.wip === false) {
            this.wip = true;
            this.init();
            this.worker.postMessage(data);
            this.worker.onmessage = (event) => {
                this.wip = false;
                if (callback) {
                    callback(event.data);
                }
                if (this.messages.length > 0) {
                    const firstMsg = this.messages.shift();
                    if (firstMsg) {
                        this.postMessage(firstMsg[0], firstMsg[1]);
                    }
                }
            };
            this.worker.onerror = (err) => {
                this.wip = false;
                console.error(`Get error "${err.message}" during loading urls`);
                callback({});
                if (this.messages.length > 0) {
                    const firstMsg = this.messages.shift();
                    if (firstMsg) {
                        this.postMessage(firstMsg[0], firstMsg[1]);
                    }
                }
            };
        } else {
            this.messages.push([data, callback]);
        }
    }
}

export { WorkerWrapper };