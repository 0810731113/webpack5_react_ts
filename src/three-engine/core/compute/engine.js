import TaskGraph from './taskgraph';
import ComputeTask from './task';

let s_theOnlyOne = null;

class ComputeEngine {
    static instance() {
        if(s_theOnlyOne == null) {
            s_theOnlyOne = new ComputeEngine();
        }
        return s_theOnlyOne;
    }
    constructor() {
        this._taskGraph = new TaskGraph();
        this._pendingTasks = [];
    }

    abort() {
        this._taskGraph.clear();
        this._pendingTasks = [];
    }

    execute() {
        if (this._pendingTasks.length > 0) {
            const tasks = this._taskGraph.getOrderedTasks();
            this._taskGraph.clear();
            this._pendingTasks = [];
            tasks.forEach(task => {
                task.compute();
            })
        }
    }

    _execute() {
        
    }

    addTask(task, runImmediately = false) {
        if(!task){
            return;
        }
        if(runImmediately) {
            task.compute();
            return;
        }
        let canBeMerged = false;
        for(let i = 0; i < this._pendingTasks.length; i++) {
            if(this._pendingTasks[i].canMergeWith(task)) {
                canBeMerged = true;
                break;
            }
        }

        if(canBeMerged) {
            return;
        }
        
        this._pendingTasks.push(task);
        const inputs = task.getInputs();
        const outputs = task.getOutputs();
        this._taskGraph.addNode(task.id, task);
        inputs.forEach(input => {
            this._taskGraph.addNode(input.entityId, input);
            this._taskGraph.addDependency(task.id, input.entityId);
        });
        outputs.forEach(output => {
            this._taskGraph.addNode(output.entityId, output);
            this._taskGraph.addDependency(output.entityId, task.id);
        })

    }

    done() {
        return this._pendingTasks.length == 0;
    }

}

export default ComputeEngine;
