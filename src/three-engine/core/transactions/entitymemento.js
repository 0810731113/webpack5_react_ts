import TransactionMemento from './transactionmemento'
import EntityMap from '../dbstorage/entitymap'

class EntityMemento extends TransactionMemento {
    constructor(snapshot) {
        super();
        snapshot.forEach((entity) => {
            const memento = JSON.stringify(entity.serialize());
            this.set(entity.revId, memento);
        })
    }
}

export default EntityMemento;