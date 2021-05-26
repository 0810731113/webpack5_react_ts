const actionStatus = Object.freeze({
    Unfinished: Symbol('Unfinished'),
    Finished: Symbol('Finished'),
    Cancelled: Symbol('Cancelled'),
});

export default actionStatus;