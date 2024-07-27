/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2024 - https://www.igorski.nl
 * Satyarth Mishra Sharma - https://github.com/satyarth/pixelsort
 * Kim Asendorf - https://github.com/kimasendorf/ASDFPixelSort 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { PixelCanvas } from "@/definitions/types";
import { findEdges } from "@/filters/edges";
import { lightness } from "@/filters/sorter/sorting";
import { getPixel } from "@/utils/canvas";
import { randInt } from "@/utils/random";

export type IntervalList = number[][]; // first dimension is y-coordinate, second dimension is x-coordinate

export enum IntervalFunction {
    RANDOM = "random",
    THRESHOLD = "threshold",
    WAVES = "waves",
    NONE = "none",
    EDGES = "edges",
};

interface IntervalProps {
    image: PixelCanvas;
    lowerThreshold: number; // 8-bit value in 0 - 255 range
    upperThreshold: number; // 8-bit value in 0 - 255 range
    charLength: number;
    intervalImage?: PixelCanvas;
}

export const getIntervals = ( fn: IntervalFunction, props: IntervalProps ): IntervalList => {
    switch ( fn ) {
        default:
            return none( props );
        case IntervalFunction.RANDOM:
            return random( props );
        case IntervalFunction.THRESHOLD:
            return threshold( props );
        case IntervalFunction.WAVES:
            return waves( props );
        case IntervalFunction.EDGES:
            return edges( props );
    }
};

function edges({ image, lowerThreshold, upperThreshold }: IntervalProps ): IntervalList {
    const edgeData = findEdges( image, upperThreshold );
    const intervals: IntervalList = [];

    const { width, height } = image;

    for ( let y = 0; y < height; ++y ) {
        intervals.push( [] );
        let flag = true;

        for ( let x = 0; x < width; ++x ) {
            if ( lightness( getPixel( edgeData, x, y )) > lowerThreshold ) {
                flag = true;
            } else if ( flag ) {
                intervals[ y ].push( x );
                flag = false;
            }
        }
    }
    return intervals;
}

function random({ image, charLength }: IntervalProps ): IntervalList {
    const { width, height } = image;
    const intervals: IntervalList = [];

    for ( let y = 0; y < height; ++y ) {
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

function threshold({ image, lowerThreshold, upperThreshold }: IntervalProps ): IntervalList {
    const { width, height } = image;
    const intervals: IntervalList = [];
    const imageData = image.context.getImageData( 0, 0, width, height );

    for ( let y = 0; y < height; ++y ) {
        intervals.push( [] );
        for ( let x = 0; x < width; ++x ) {
            const level = lightness( getPixel( imageData, x, y ));
            if ( level < lowerThreshold || level > upperThreshold ) {
                intervals[ y ].push( x );
            }
        }
    }
    return intervals;
}

function waves({ image, charLength }: IntervalProps ): IntervalList {
    const intervals: IntervalList = [];
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

function none({ image }: IntervalProps ): IntervalList {
    return new Array( image.height ).fill( [] );
}
