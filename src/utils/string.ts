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
import type { SortSettings } from "@/definitions/types";
import type { SortingType } from "@/filters/sorter/sorting";
import type { IntervalFunction } from "@/filters/sorter/interval";

export const settingToString = ( setting: SortSettings ): string => {
    const { width, height, angle, randomness, charLength, lowerThreshold, upperThreshold, sortingType, intervalFunction } = setting;
    return `a${angle}_l${lowerThreshold.toFixed(2)}_u${upperThreshold.toFixed(2)}_r${randomness.toFixed(2)}_s${sortingType}_i${intervalFunction}_c${charLength.toFixed(2)}_w${width}_h${height}`;
};

export const stringToSetting = ( string: string ): SortSettings => {
    const arr = string.split( "_" );

    return {
        angle: parseFloat( arr[ 0 ].substring( 1 )),
        lowerThreshold: parseFloat( arr[ 1 ].substring( 1 )),
        upperThreshold: parseFloat( arr[ 2 ].substring( 1 )),
        randomness: parseFloat( arr[ 3 ].substring( 1 )),
        sortingType: arr[ 4 ].substring( 1 ) as SortingType,
        intervalFunction: arr[ 5 ].substring( 1 ) as IntervalFunction,
        charLength: parseFloat( arr[ 6 ].substring( 1 )),
        width: parseFloat( arr[ 7 ].substring( 1 )),
        height: parseFloat( arr[ 8 ].substring( 1 )),
    };
};