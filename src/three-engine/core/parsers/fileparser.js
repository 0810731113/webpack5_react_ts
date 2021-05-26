class FileParser {
    constructor(worker) {
        this.type = '';
        this.worker = worker;
        this.data = {};
        this.min = [0.0, 0.0, 0.0];
        this.max = [0.0, 0.0, 0.0];
    }

    parse() {

    }

    calculateBoundingBox() {
        if (this.data.meshes && this.data.meshes.length > 0) {
            for (let i = 0; i  < this.data.meshes.length; ++i) {
                const meshBody = this.data.meshes[i];
                for (let j = 0; j < meshBody.vertices.length; j += 3) {
                    if (i === 0 && j === 0) {
                        this.min[0] = this.max[0] = meshBody.vertices[0];
                        this.min[1] = this.max[1] = meshBody.vertices[1];
                        this.min[2] = this.max[2] = meshBody.vertices[2];
                    } else {
                        this.min[0] = this.min[0] > meshBody.vertices[j] ? meshBody.vertices[j] : this.min[0];
                        this.min[1] = this.min[1] > meshBody.vertices[j + 1] ? meshBody.vertices[j + 1] : this.min[1];
                        this.min[2] = this.min[2] > meshBody.vertices[j + 2] ? meshBody.vertices[j + 2] : this.min[2];
                        this.max[0] = this.max[0] < meshBody.vertices[j] ? meshBody.vertices[j] : this.max[0];
                        this.max[1] = this.max[1] < meshBody.vertices[j + 1] ? meshBody.vertices[j + 1] : this.max[1];
                        this.max[2] = this.max[2] < meshBody.vertices[j + 2] ? meshBody.vertices[j + 2] : this.max[2];                       
                    }
                }
            }
        }
    }
}

export { FileParser };