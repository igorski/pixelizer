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
import type { CachedPixelCanvas, PixelCanvas } from "@/definitions/types";
import { applyThreshold } from "@/filters/threshold";
import { getCachedRotation, setCachedRotation, getCachedMask, setCachedMask } from "@/filters/sorter/cache";
import { IntervalFunction } from "@/filters/sorter/interval";
import { SortingType } from "@/filters/sorter/sorting";
import { createCanvas, cacheCanvas, cropCanvas, rotateCanvas } from "@/utils/canvas";
import { prepare, waitWhenBusy } from "@/utils/rafDebounce";
// @ts-expect-error TS lint cannot find module but Vite will take care of it
import FilterWorker from "@/filters/workers/filter.worker?worker";

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

type SortingJob = {
    size: Size;
    orgSize: Size;
    angle: number;
    resolve: ( canvas: PixelCanvas ) => void;
    reject: ( error: Error ) => void;
};

let worker: FilterWorker;
let job: SortingJob | undefined;

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

    if ( !worker ) {
        worker = new FilterWorker(); // lazily instantiate the Worker
        worker.onmessage = handleWorkerMessage;
    }

    const hasRotation = ( angle % 360 ) !== 0;
    const orgSize = {
        width  : image.width,
        height : image.height,
    };

    // TODO : caches should go to worker too??
    if ( hasRotation ) {
        const { id } = image;
        const cached = getCachedRotation( id, angle );

        if ( cached ) {
            image = cached;
        } else {
            image = cacheCanvas( rotateCanvas( image, angle ));
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
    
    return new Promise(( resolve, reject ) => {
        job = {
            size,
            orgSize,
            angle,
            resolve,
            reject,
        };

        worker.postMessage({
            cmd: "process",
            data: {
                image: {
                    width: image.width,
                    height: image.height,
                    data: image.data.data.buffer,
                },
                mask: {
                    width: maskImage.width,
                    height: maskImage.height,
                    data: maskImage.data.data.buffer,
                },
                lowerThreshold,
                upperThreshold,
                charLength,
                randomness,
                intervalFunction,
                sortingType,
                size,
            }
        }, []);// image.data.data.buffer, maskImage.data.data.buffer ]);
    });
}

/* internal methods */

function handleWorkerMessage({ data }: MessageEvent ): void {
    if ( job === undefined ) {
        return;
    }
    
    if ( data?.cmd === "result" ) {
        const { width, height } = job.size;

        let output = createCanvas( width, height, true );
        output.context.putImageData( new ImageData( new Uint8ClampedArray( data.data ), width, height ), 0, 0 );

        const hasRotation = ( job.angle % 360 ) !== 0;

        if ( hasRotation ) {
            output = cropCanvas( rotateCanvas( output, -job.angle ), job.orgSize.width, job.orgSize.height, true );
        }
        job.resolve( output );
        job = undefined;
    }
    else if ( data?.cmd === "error" ) {
        job.reject( data.error );
        job = undefined;
    }
}
