const curveTypes = Object.freeze({
    Point: Symbol.for('point'),
    Line: Symbol.for('line'),
    Arc: Symbol.for('arc'),
    Circle: Symbol.for('circle')
});

export default curveTypes;