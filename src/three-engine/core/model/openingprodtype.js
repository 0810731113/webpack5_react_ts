const openingProdType = Object.freeze({
    SingleDoor: Symbol.for('singleDoor'),
    DoubleDoor: Symbol.for('doubleDoor'),
    SlidingDoor: Symbol.for('slidingDoor'),

    NormalWindow: Symbol.for('normalWindow'),
    FrenchWindow: Symbol.for('frenchWindow'),
    BayWindow: Symbol.for('bayWindow'),

    Pass: Symbol.for('pass'),
    PrimarySecondaryDoor:Symbol.for('primarySecondaryDoor'),
});

export default openingProdType;