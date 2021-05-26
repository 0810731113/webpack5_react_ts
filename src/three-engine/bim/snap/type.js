const SnapTypes = Object.freeze({
    X: Symbol.for('x'),
    Y: Symbol.for('y'),
    Wall: Symbol.for('wall'),
    Connector: Symbol.for('connector'),
    Horz: Symbol.for('horz'),
    Vert: Symbol.for('vert'),
    Polygon: Symbol.for('polygon'),
    Pivot: Symbol.for('pivot'),
    EndPoint: Symbol.for('endpoint'),
    FootPoint: Symbol.for('footpoint'),
    MidPoint: Symbol.for('midpoint'),
    Segment: Symbol.for('segment'),
    None: Symbol.for('none'),
    General: Symbol.for('general'),
    Cross: Symbol.for('cross')
});

export { SnapTypes };