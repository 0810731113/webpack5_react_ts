import { ColorSchemeBase } from '../base';
import { ColorSchemeTypes } from '../types';
import { ColorSchemeDefs } from '../def';

class WhiteScheme extends ColorSchemeBase {
    constructor() {
        super(ColorSchemeTypes.White);
    }

    static make() {
        return new WhiteScheme()._init();
    }

    _getConfig() {
        return [

            // scene grid
            //
            ColorSchemeDefs.SCENE_BACKGROUND, { color: 0xF9F9F9, opa: 1 },
            ColorSchemeDefs.SCENE_GRID_MASTER, { color: 0x292929, opa: 0.16 },
            ColorSchemeDefs.SCENE_GRID_SECONDARY, { color: 0x888888, opa: 0.16 },

            // wall
            //
            ColorSchemeDefs.WALL2d_BEARING, { color: 0x424242, opa: 1 },
            ColorSchemeDefs.WALL2d_PARAPET, { color: 0xFFFFFF, opa: 1 },
            ColorSchemeDefs.WALL2d_NORMAL, { color: 0xC9C9C9, opa: 1 },
            ColorSchemeDefs.WALL2d_EDGE, { color: 0x000000, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR, { color: 0xA0A0A0, opa: 0.8 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_FILL, { color: 0xFFB61E, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_INNER, { color: 0x333333, opa: 1 },
            ColorSchemeDefs.WALL2d_CONNECTOR_ISOLATED_OUTER, { color: 0x777777, opa: 1 },

            // opening
            //
            ColorSchemeDefs.OPENING2d_EDGE, { color: 0x000000, opa: 1 },
            ColorSchemeDefs.OPENING2d_FILL, { color: 0xFFFFFF, opa: 1 },
            ColorSchemeDefs.OPENING2d_SECTOR, { color: 0xFFFFFF, opa: 0.5 },

            // dim
            //
            ColorSchemeDefs.DIM2d_LINE, { color: 0x000000, opa: 0.5 },
            ColorSchemeDefs.DIM2d_LINE_PREVIEW, { color: 0x0000FF, opa: 1 },

            // font | text
            //
            ColorSchemeDefs.FONT2d_EDGE, { color: 0xFFFFFF, opa: 0.99 },
            ColorSchemeDefs.FONT2d_FILL, { color: 0x000000, opa: 0.99 },

            // navigator
            //
            ColorSchemeDefs.NAVIGATOR2d_BACKGROUND, { color: 0xffffff, opa: 1 },
            ColorSchemeDefs.NAVIGATOR2d_ROOM, { color: 0xD9D9D9, opa: 1 },

            // column
            //
            ColorSchemeDefs.COLUMN2d, { color: 0x000000, opa: 1 }
        ];
    }
}

export { WhiteScheme }