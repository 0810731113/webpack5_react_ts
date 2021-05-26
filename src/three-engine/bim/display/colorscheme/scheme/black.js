import { ColorSchemeTypes } from '../types';
import { ColorSchemeBase } from '../base';
import { ColorSchemeDefs } from '../def';

class BlackScheme extends ColorSchemeBase {
    constructor() {
        super(ColorSchemeTypes.Black);
    }

    static make() {
        return new BlackScheme()._init();
    }

    _getConfig() {
        return [

            // scene grid
            //
            ColorSchemeDefs.SCENE_BACKGROUND, { color: 0x1D2125, opa: 1 },
            ColorSchemeDefs.SCENE_GRID_MASTER, { color: 0x7B829A, opa: 0.1 },
            ColorSchemeDefs.SCENE_GRID_SECONDARY, { color: 0x292E33, opa: 0.1 },

            // wall
            //
            ColorSchemeDefs.WALL2d_BEARING, { color: 0xF6F6F6, opa: 1 },
            ColorSchemeDefs.WALL2d_PARAPET, { color: 0x08090C, opa: 1 },
            ColorSchemeDefs.WALL2d_NORMAL, { color: 0x6E7B8B, opa: 1 },
            ColorSchemeDefs.WALL2d_EDGE, { color: 0xFFFFFF, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR, { color: 0x444444, opa: 0.5 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_FILL, { color: 0xFFB61E, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_INNER, { color: 0x333333, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_OUTER, { color: 0xFFFFFF, opa: 1 },

            // opening
            //
            ColorSchemeDefs.OPENING2d_EDGE, { color: 0xFFFFFF, opa: 1 },
            ColorSchemeDefs.OPENING2d_FILL, { color: 0x292f36, opa: 1 },
            ColorSchemeDefs.OPENING2d_SECTOR, { color: 0x292f36, opa: 0.3 },

            // dim
            //
            ColorSchemeDefs.DIM2d_LINE, { color: 0xFFFFFF, opa: 0.5 },
            ColorSchemeDefs.DIM2d_LINE_PREVIEW, { color: 0xFFFFFF, opa: 1 },

            // font | text
            //
            ColorSchemeDefs.FONT2d_EDGE, { color: 0x000000, opa: 0.99 },
            ColorSchemeDefs.FONT2d_FILL, { color: 0xFFFFFF, opa: 0.99 },

            // navigator
            //
            ColorSchemeDefs.NAVIGATOR2d_BACKGROUND, { color: 0x373F48, opa: 1 },
            ColorSchemeDefs.NAVIGATOR2d_ROOM, { color: 0x596370, opa: 1 },

            // column
            //
            ColorSchemeDefs.COLUMN2d, { color: 0xFFFFFF, opa: 1 }
        ];
    }
}

export { BlackScheme }