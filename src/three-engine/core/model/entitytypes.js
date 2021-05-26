const entityTypes = Object.freeze({
    Edge: Symbol.for('edge'),
    Face: Symbol.for('face'),
    Body: Symbol.for('body'),
    Mesh: Symbol.for('mesh'),
    Inst: Symbol.for('inst'),
    Comp: Symbol.for('comp'),
    Manipulator: Symbol.for('manipulator'),
    Cube: Symbol.for('cube'),
    Project: Symbol.for('project'),
    Folder: Symbol.for('folder'),
    Model: Symbol.for('model'),
    Element: Symbol.for('element'),
    Asset: Symbol.for('asset'),
    AxisGrid: Symbol.for('axisgrid'),
    AxisLine: Symbol.for('axisLine'),
    AxisArc: Symbol.for('axisArc'),
    AxisGroup: Symbol.for('axisgroup'),
    AxisGridCustomized: Symbol.for('axisgridcustomized'),
    AxisGridPreview: Symbol.for('axisgridpreview'),
    OffsetPreview: Symbol.for('offsetpreview')
});

export { entityTypes };