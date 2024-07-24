import { Pixel } from "@/definitions/types";

export type SortingFunction = ( pixel: Pixel ) => number;

export enum SortingType {
    LIGHTNESS = "lightness",
    HUE = "hue",
    INTENSITY = "intensity",
    MINIMUM = "minimum",
    SATURATION = "saturation",
};

export const getSortingFunction = ( fn: SortingType ): SortingFunction => {
    switch ( fn ) {
        default:
        case SortingType.LIGHTNESS:
            return lightness;
        case SortingType.HUE:
            return hue;
        case SortingType.INTENSITY:
            return intensity;
        case SortingType.MINIMUM:
            return minimum;
        case SortingType.SATURATION:
            return saturation;
    }
};

export function lightness( pixel: Pixel ): number {
    const [ r, g, b ] = pixel;

    const maxc = Math.max( r, g, b );
    const minc = Math.min( r, g, b );

    return ( minc + maxc ) / 2;
};

function hue( pixel: Pixel ): number {
    const [ r, g, b ] = pixel;

    const maxc = Math.max( r, g, b );
    const minc = Math.min( r, g, b );
  
    if ( minc === maxc ) {
        return 0;
    }

    const mcminusmc = maxc - minc;
    const rc = ( maxc - r ) / mcminusmc;
    const gc = ( maxc - g ) / mcminusmc;
    const bc = ( maxc - b ) / mcminusmc;

    let h = 0;

    if ( r === maxc ) {
        h = bc - gc;
    } else if ( g === maxc ) {
        h = 2 + rc - bc
    } else {
        h = 4 + gc - rc;
    }
    h = ( h / 6 ) % 1;

    return h;
};

function saturation( pixel: Pixel ): number {
    const [ r, g, b ] = pixel;

    const maxc = Math.max( r, g, b );
    const minc = Math.min( r, g, b );
    const sumc = minc + maxc;
    const diffc = maxc - minc;
    const sdiv = 2 - diffc;

    if ( minc === maxc || sumc === 0 || sdiv === 0 ) {
        return 0;
    }
    
    let s = 0;

    if ( sumc / 2 <= 0.5 ) {
        s = diffc / sumc;
    } else {
        s = diffc / sdiv;
    }
    return s;
};

function intensity( pixel: Pixel ): number {
    return pixel[ 0 ] + pixel[ 1 ] + pixel[ 2 ];
};

function minimum( pixel: Pixel ): number {
    return Math.min( pixel[ 0 ], pixel[ 1 ], pixel[ 2 ]);
};
