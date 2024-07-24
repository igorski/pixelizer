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
import type { Size } from "zcanvas";
import type { PixelList } from "@/definitions/types";
import type { IntervalList } from "@/filters/sorter/interval";
import type { SortingFunction } from "@/filters/sorter/sorting";
import { getPixel } from "@/utils/canvas";

export interface SortProps {
    size: Size;
    intervals: IntervalList;
    imageData: ImageData;
    maskData?: ImageData;
    randomness: number;
    sortingFunction: SortingFunction;
};

export const sortImage = ({ size, imageData, maskData, intervals, randomness, sortingFunction }: SortProps ): PixelList[] => {

    const sortedPixels: PixelList[] = [];
    const { width, height } = size;

    for ( let y = 0; y < height; ++y ) {
        let row: PixelList = [];
        let minX = 0;

        const intervalRow = [ ...intervals[ y ], width ];
        
        for ( const maxX of intervalRow ) {
            const interval: PixelList = [];

            if ( maskData ) {
                for ( let x = minX; x < maxX; ++x ) {
                    if ( getPixel( maskData, x, y )) {
                        interval.push( getPixel( imageData, x, y )! );
                    }
                }
            }
            
            if ( Math.random() < randomness ) {
                row = row.concat( interval );
            } else {
                row = row.concat( sortInterval( interval, sortingFunction ));
            }
            minX = maxX;
        }
        sortedPixels.push( row );
    }
    return sortedPixels;
};

/**
 * Input Pixel will become single number value
 */
function sortInterval( interval: PixelList, sortingFunction: SortingFunction ): PixelList {
    if ( interval.length === 0 ) {
        return [];
    }
    return interval.sort(( a, b ) => sortingFunction( a ) - sortingFunction( b ));
}
