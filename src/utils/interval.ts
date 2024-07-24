import { CoordinateList, PixelCanvas } from "@/definitions/types";
import { getPixel } from "./canvas";
import { lightness } from "./sorting";
import { randInt } from "./random";

export enum IntervalFunction {
    RANDOM = "random",
    THRESHOLD = "threshold",
    WAVES = "waves",
    NONE = "none",
    // EDGES = "edges",
};

interface IntervalProps {
    image: PixelCanvas;
    lowerThreshold: number;
    upperThreshold: number;
    charLength: number;
    intervalImage?: PixelCanvas;
}

export const getIntervals = ( fn: IntervalFunction, props: IntervalProps ): CoordinateList => {
    switch ( fn ) {
        default:
            return none( props );
        case IntervalFunction.RANDOM:
            return random( props );
        case IntervalFunction.THRESHOLD:
            return threshold( props );
        case IntervalFunction.WAVES:
            return waves( props );
        // case IntervalFunction.EDGE:
        //    return edge( props );
    }
};

/*
function edge({ image, lowerThreshold }: IntervalProps ): CoordinateList {
    const edgeData = image.filter(ImageFilter.FIND_EDGES).convert('RGBA').load()
    const intervals: CoordinateList = [];

    const { width, height } = image;

    for ( let y = 0; y < height; ++y ) {
        intervals.push( [] );
        let flag = true;

        for ( let x = 0; x < width; ++x ) {
            if ( lightness( getPixel( edgeData, x, y )) > lowerThreshold * 255 ) {
                flag = true;
            } else if ( flag ) {
                intervals[ y ].push( x );
                flag = false;
            }
        }
    }
    return intervals;
}*/

function random({ image, charLength }: IntervalProps ): CoordinateList {
    const { width, height } = image;
    const intervals: CoordinateList = [];

    for ( let y = 0; y < height; ++ y ) {
        intervals.push( [] );
        let x = 0;

        while ( true ) {
            x += Math.round( charLength * Math.random() );
            if ( x > width ) {
                break;
            }
            intervals[ y ].push( x );
        }
    }
    return intervals;
}

function threshold({ image, lowerThreshold, upperThreshold }: IntervalProps ): CoordinateList {
    const { width, height } = image;
    const intervals: CoordinateList = [];
    const imageData = image.context.getImageData( 0, 0, width, height );

    for ( let y = 0; y < height; ++y ) {
        intervals.push( [] );
        for ( let x = 0; x < width; ++x ) {
            const level = lightness( getPixel( imageData, x, y ));
            if ( level < lowerThreshold * 255 || level > upperThreshold * 255 ) {
                intervals[ y ].push( x );
            }
        }
    }
    return intervals;
}

function waves({ image, charLength }: IntervalProps ): CoordinateList {
    const intervals: CoordinateList = [];
    const { width, height } = image;

    for ( let y = 0; y < height; ++y ) {
        intervals.push( [] );
        let x = 0;

        while ( true ) {
            x += charLength + randInt( 0, 10 );
            if ( x > width ) {
                break;
            }
            intervals[ y ].push( x );
        }
    }
    return intervals;
}

function none({ image }: IntervalProps ): CoordinateList {
    return new Array( image.height ).fill( [] );
}
