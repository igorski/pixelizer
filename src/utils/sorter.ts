import type { CoordinateList, Size, PixelList } from "@/definitions/types";
import { getPixel } from "./canvas";
import type { SortingFunction } from "./sorting";

export interface SortProps {
    size: Size;
    intervals: CoordinateList;
    imageData: ImageData;
    maskData?: ImageData;
    randomness: number;
    sortingFunction: SortingFunction;
}

export const sortImage = ({ size, imageData, maskData, intervals, randomness, sortingFunction }: SortProps ): PixelList[] => {

    const sortedPixels: PixelList[] = [];
    const { width, height } = size;

    for ( let y = 0; y < height; ++y ) {
        let row: PixelList = [];
        let x_min = 0;
        
        for ( const x_max of [...intervals[ y ], width ]) {
            const interval: PixelList = [];

            if ( maskData ) {
                for ( let x = x_min; x < x_max; ++x ) {
                    if ( getPixel( maskData, x, y )) {
                        interval.push( getPixel( imageData, x, y )! );
                    }
                }
            }
            
            if ( Math.random() * 100 < randomness ) {
                row = row.concat( interval );
            } else {
                row = row.concat( sortInterval( interval, sortingFunction ));
            }
            x_min = x_max;
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
    // return [ ...interval ].map( sortingFunction ).sort(( a, b ) => a - b );

    return interval.sort(( a, b ) => sortingFunction( a ) - sortingFunction( b ));
}
