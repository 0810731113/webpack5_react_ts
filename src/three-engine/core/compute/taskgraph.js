import { DepGraph } from 'dependency-graph'
import ComputeTask from './task';

class TaskGraph {
    constructor() {
        this._depGraph = new DepGraph();
    }

    size() {
        return this._depGraph.size();
    }

    addNode(id, node) {
        this._depGraph.addNode(id, node);
    }

    addDependency(from, to) {
        this._depGraph.addDependency(from, to);
    }

    getOrderedTasks() {
        try {
            let ids = this._depGraph.overallOrder();
            let nodes = ids.map((id) => {
                return this._depGraph.getNodeData(id);
            })
            const tasks = nodes.filter( (node) => {
                return (node instanceof ComputeTask);
            });
            return tasks;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    clear() {
        this._depGraph = new DepGraph();
    }
}

export default TaskGraph;