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
import type { PixelCanvas, CachedPixelCanvas, SortSettings } from "@/definitions/types";
import { pixelsort } from "@/filters/pixel-sorter";

type RenderResult = Promise<PixelCanvas | undefined>;
type DelayedRender = {
    resolve: ( value: unknown ) => void;
    reject: VoidFunction;
    execute: () => Promise<void>;
};

let renderPending = false;
let nextRender: DelayedRender | undefined;

/**
 * This method throttles repeated render requests.
 * In case a render is still pending when a new render comes in, the new request will be enqueued
 * to be executed once the previous request has finished. In the case multiple render requests come in
 * the older ones will be rejected (as their state is no longer relevant with a newer request having come in).
 */
export const applyFilters = async ( image: CachedPixelCanvas, sortSettings: SortSettings, maskImage?: CachedPixelCanvas ): RenderResult => {
    const { width, height, ...settings } = sortSettings;

    if ( renderPending ) {
        return enqueueRender( image, sortSettings, maskImage );
    }

    renderPending = true;

    try { 
        const sortedImage = await pixelsort({
            image,
            maskImage,
            ...settings,
        });
        return sortedImage;
    } catch ( e ) {
        console.error( `Irrecoverable error occurred during sorting: ${e.message}`, e );
    } finally {
        window.requestAnimationFrame(() => {
            renderPending = false;
            if ( nextRender ) {
                nextRender.execute(); // execute next job if one was enqeueued
            }
        });
    }
};

/* internal methods */

function enqueueRender( image: CachedPixelCanvas, sortSettings: SortSettings, maskImage: CachedPixelCanvas ): RenderResult {
    if ( nextRender ) {
        nextRender.reject(); // discard previously enqueued render
    }

    let localResolve: ( value: unknown ) => void;
    let localReject: () => void;
    const delayedApplication = new Promise(( resolve, reject ) => {
        localResolve = resolve;
        localReject  = reject;
    }) as RenderResult;
    
    nextRender = {
        resolve : localResolve,
        reject  : localReject,
        execute : async (): Promise<void> => {
            nextRender = undefined;
            try {
                localResolve( await applyFilters( image, sortSettings, maskImage ));
            } catch {
                localReject();
            }
        },
    };
    return delayedApplication;
}
