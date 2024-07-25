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
import type { PixelCanvas, PixelList } from "@/definitions/types";
import { applyThreshold } from "@/filters/threshold";
import { getCachedRotation, setCachedRotation, getCachedMask, setCachedMask } from "@/filters/sorter/cache";
import { getIntervals, IntervalFunction } from "@/filters/sorter/interval";
import { sortImage } from "@/filters/sorter/sorter";
import { getSortingFunctionByType, SortingType } from "@/filters/sorter/sorting";
import { createCanvas, cloneCanvas, cropCanvas, rotateCanvas, getPixel, setPixel } from "@/utils/canvas";

interface PixelSortParams {
    image: PixelCanvas;
    maskImage?: PixelCanvas;
    intervalImage?: PixelCanvas;
    randomness?: number; // normalized 0 - 1 range
    charLength?: number; // normalized 0 - 1 range
    lowerThreshold?: number; // normalized 0 - 1 range
    upperThreshold?: number; // normalized 0 - 1 range
    sortingFunction?: SortingType,
    intervalFunction?: IntervalFunction;
    angle?: number;
}

export const pixelsort = ({ image, maskImage, intervalImage, randomness = 0, charLength = 0.5,
    sortingFunction = SortingType.LIGHTNESS, intervalFunction = IntervalFunction.THRESHOLD,
    lowerThreshold = 0.25, upperThreshold = 0.8, angle = 0 }: PixelSortParams ): PixelCanvas => {

    const hasRotation = ( angle % 360 ) !== 0;
    const orgSize = {
        width  : image.width,
        height : image.height,
    };

    if ( hasRotation ) {
        const { id } = image;
        const cached = getCachedRotation( id, angle );

        if ( cached ) {
            image = cached;
        } else {
            image = rotateCanvas( cloneCanvas( image ), angle );
            setCachedRotation( id, angle, image );
        }
    }
    const { width, height } = image;
    const size = { width, height };

    const imageData = image.context.getImageData( 0, 0, width, height );
    
    const cachedMask = getCachedMask( image.width, image.height, angle );

    if ( cachedMask ) {
        maskImage = cachedMask;
    } else {
        maskImage = maskImage ?? createCanvas( image.width, image.height );
        maskImage = rotateCanvas( applyThreshold( maskImage ), angle );

        setCachedMask( image.width, image.height, angle, maskImage );
    }
    const maskData = maskImage.context.getImageData( 0, 0, maskImage.width, maskImage.height );
    
    charLength = Math.round( charLength * 400 );//size.width; // for maximum width of source image
    
    const intervals = getIntervals( intervalFunction, {
        image,
        lowerThreshold,
        upperThreshold,
        charLength,
        intervalImage,
    });

    const sortedPixels = sortImage({
        size,
        imageData,
        maskData,
        intervals,
        randomness,
        sortingFunction: getSortingFunctionByType( sortingFunction )
    });

    let output = placePixels(
        sortedPixels,
        imageData,
        size,
        maskData,
    );
    
    if ( hasRotation ) {
        output = cropCanvas( rotateCanvas( output, -angle ), orgSize.width, orgSize.height, true );
    }
    return output;
}

function placePixels( pixels: PixelList[], original: ImageData, size: Size, mask?: ImageData ): PixelCanvas {
    const { width, height } = size;

    const output = createCanvas( width, height, true );
    const outputdata = output.context.getImageData( 0, 0, width, height );

    for ( let y = 0; y < height; ++y ) {
        let count = 0;
        for ( let x = 0; x < width; ++x ) {
            if ( mask && getPixel( mask, x, y )) {
                const pixel = pixels[ y ][ count ];
                pixel && setPixel( outputdata, x, y, pixel );
                ++count;
            } else {
                const pixel = getPixel( original, x, y );
                pixel && setPixel( outputdata, x, y, pixel );
            }
        }
    }
    output.context.putImageData( outputdata, 0, 0 );

    return output;
}
