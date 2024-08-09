/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2024 - https://www.igorski.nl
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
import type { Size } from "zcanvas";
import type { PixelList } from "@/definitions/types";
import { getIntervals, IntervalFunction } from "@/filters/sorter/interval";
import { sortImage } from "@/filters/sorter/sorter";
import { getSortingFunctionByType, SortingType } from "@/filters/sorter/sorting";
import { getPixel, setPixel, hasPixel } from "@/utils/canvas";

type PixelBuffer = {
    width: number;
    height: number;
    data: ArrayBuffer;
};

export interface FilterRequest {
    image: PixelBuffer;
    mask: PixelBuffer;
    randomness: number;
    charLength: number;
    lowerThreshold: number;
    upperThreshold: number;
    sortingType?: SortingType,
    intervalFunction: IntervalFunction;
    size: Size;
}

let imageData: ImageData;
let maskData: ImageData;

self.addEventListener( "message", ( event: MessageEvent ): void => {
    const { cmd, data }: { cmd: string, data: FilterRequest } = event.data;
    switch ( cmd ) {
        default:
            break;

        case "process":
            try {
                imageData = new ImageData( new Uint8ClampedArray( data.image.data ), data.image.width, data.image.height );
                maskData  = new ImageData( new Uint8ClampedArray( data.mask.data ), data.mask.width, data.mask.height );

                const { lowerThreshold, upperThreshold, charLength, size, randomness, sortingType, intervalFunction } = data;

                setProgress( 20 );

                const intervals = getIntervals( intervalFunction, {
                    image: imageData,
                    lowerThreshold,
                    upperThreshold,
                    charLength,
                });

                setProgress( 50 );
        
                const sortedPixels = sortImage({
                    size,
                    imageData,
                    maskData,
                    intervals,
                    randomness,
                    sortingFunction: getSortingFunctionByType( sortingType )
                });

                setProgress( 80 );
    
                const output = placePixels(
                    sortedPixels,
                    imageData,
                    size,
                    maskData,
                );

                setProgress( 100 );
                
                self.postMessage({ cmd: "result", data: output.data.buffer }, { transfer: [ output.data.buffer ]});
            } catch ( error: unknown ) {
                self.postMessage({ cmd: "error", error });
            }
            break;
    }
});

/* internal methods */

function setProgress( value: number ): void {
    self.postMessage({ cmd: "progress", progress: value });
}

function placePixels( pixels: PixelList[], original: ImageData, size: Size, mask: ImageData ): ImageData {
    const { width, height } = size;

    const output = new ImageData( width, height );

    for ( let y = 0; y < height; ++y ) {
        let count = 0;
        for ( let x = 0; x < width; ++x ) {
            if ( hasPixel( mask, x, y )) {
                const pixel = pixels[ y ][ count ];
                pixel && setPixel( output, x, y, pixel );
                ++count;
            } else {
                const pixel = getPixel( original, x, y );
                pixel && setPixel( output, x, y, pixel );
            }
        }
    }
    return output;
}
