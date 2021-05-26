const ControllerFactoryTypes = Object.freeze({
    Viewer2d: Symbol.for('viewer2d'),
    Viewer3d: Symbol.for('viewer3d'),
    Custom2d: Symbol.for('custom2d'),
    Lighting2d: Symbol.for('lighting2d'),
    Modular2d: Symbol.for('modular2d'),
    Modular3d: Symbol.for('modular3d'),
    Rendering2d: Symbol.for('rendering2d'),
});

export { ControllerFactoryTypes };