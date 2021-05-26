import { ObjParser } from './objparser.js';

const parsers = {
    'obj': ObjParser
};

const parserFactory = {
    create: (type, worker, args) => {
        if (parsers[type]) {
            return new parsers[type](worker, args);
        } else {
            return null;
        }
    }
};

export { parserFactory };