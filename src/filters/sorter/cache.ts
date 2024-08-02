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
import type { CachedPixelCanvas } from "@/definitions/types";

type Cache = {
    rotation: Record<string, CachedPixelCanvas>;
    mask: Record<string, CachedPixelCanvas>;
};

const canvasCache: Cache = {
    rotation: {},
    mask: {},
};

export const getCachedRotation = ( id: string, angle: number ): CachedPixelCanvas | undefined => {
    const key = `${id}_${angle}`;
    return canvasCache.rotation[ key ];
};

export const setCachedRotation = ( id: string, angle: number, canvas: CachedPixelCanvas ): void => {
    const key = `${id}_${angle}`;
    canvasCache.rotation[ key ] = canvas;
};

export const getCachedMask = ( id: string ): CachedPixelCanvas | undefined => {
    return canvasCache.mask[ id ];
};

export const setCachedMask = ( id: string, canvas: CachedPixelCanvas ): void => {
    canvasCache.mask[ id ] = canvas;
};

export const flushCaches = (): void => {
    canvasCache.rotation = {};
    canvasCache.mask = {};
};