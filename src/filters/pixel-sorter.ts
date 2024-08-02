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
import type { CachedPixelCanvas, PixelCanvas, PixelList } from "@/definitions/types";
import { applyThreshold } from "@/filters/threshold";
import { getCachedRotation, setCachedRotation, getCachedMask, setCachedMask } from "@/filters/sorter/cache";
import { getIntervals, IntervalFunction } from "@/filters/sorter/interval";
import { sortImage } from "@/filters/sorter/sorter";
import { getSortingFunctionByType, SortingType } from "@/filters/sorter/sorting";
import { createCanvas, cacheCanvas, cloneCanvas, cropCanvas, rotateCanvas, getPixel, setPixel, hasPixel } from "@/utils/canvas";
import { prepare, waitWhenBusy } from "@/utils/rafDebounce";

interface PixelSortParams {
    image: CachedPixelCanvas;
    maskImage?: CachedPixelCanvas;
    randomness?: number; // normalized 0 - 1 range
    charLength?: number; // normalized 0 - 1 range
    lowerThreshold?: number; // normalized 0 - 1 range
    upperThreshold?: number; // normalized 0 - 1 range
    sortingType?: SortingType,
    intervalFunction?: IntervalFunction;
    angle?: number;
}

/**
 * The main render function.
 * 
 * It is asynchronous and has multiple waiting steps in between (potentially) heavy functions with a long
 * execution time. It will wait until the next animationFrame if the allowed time budget has expired.
 * 
 * Would it make sense to do this in a Worker / use OfflineScreenCanvas ?
 * That would be an improvement that frees up the main execution stack. However, this function requires
 * creation of multiple Canvas elements and Contexts (with different aliasing options) which are not
 * available inside Workers. Arguably relying solely on ImageData would work, but complicates the current
 * use of cached rotations and masks.
 */
export const pixelsort = async ({ image, maskImage, randomness = 0, charLength = 0.5,
    sortingType = SortingType.LIGHTNESS, intervalFunction = IntervalFunction.THRESHOLD,
    lowerThreshold = 0.25, upperThreshold = 0.8, angle = 0 }: PixelSortParams ): Promise<PixelCanvas> => {

    prepare(); // prepares the time budget

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
            image = cacheCanvas( rotateCanvas( cloneCanvas( image ), angle ));
            setCachedRotation( id, angle, image );
        }
    }
    const { width, height } = image;
    const size = { width, height };
    
    const maskSourceId = maskImage?.id ?? image.id;
    const cachedMask   = getCachedMask( maskSourceId );

    if ( cachedMask ) {
        maskImage = cachedMask;
    } else {
        maskImage = cacheCanvas( applyThreshold( maskImage ?? createCanvas( width, height )));

        setCachedMask( maskSourceId, maskImage );
    }
    
    await waitWhenBusy(); // wait in case previous executions have exceeded the time budget
    
    // scale values
    charLength = Math.round( charLength * 400 /* or size.width */ );
    lowerThreshold *= 255;
    upperThreshold *= 255;
    
    const intervals = getIntervals( intervalFunction, {
        image,
        lowerThreshold,
        upperThreshold,
        charLength,
    });

    await waitWhenBusy(); // wait in case previous executions have exceeded the time budget

    const sortedPixels = sortImage({
        size,
        imageData: image.data,
        maskData: maskImage.data,
        intervals,
        randomness,
        sortingFunction: getSortingFunctionByType( sortingType )
    });

    await waitWhenBusy(); // wait in case previous executions have exceeded the time budget

    let output = placePixels(
        sortedPixels,
        image.data,
        size,
        maskImage.data,
    );
    
    if ( hasRotation ) {
        output = cropCanvas( rotateCanvas( output, -angle ), orgSize.width, orgSize.height, true );
    }
    return output;
}

function placePixels( pixels: PixelList[], original: ImageData, size: Size, mask: ImageData ): PixelCanvas {
    const { width, height } = size;

    const output = createCanvas( width, height, true );
    const outputdata = output.context.getImageData( 0, 0, width, height );

    for ( let y = 0; y < height; ++y ) {
        let count = 0;
        for ( let x = 0; x < width; ++x ) {
            if ( hasPixel( mask, x, y )) {
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
