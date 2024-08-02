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
import type { IntervalFunction } from "@/filters/sorter/interval";
import type { SortingType } from "@/filters/sorter/sorting";

export interface SortSettings {
    width: number;
    height: number;
    angle: number;
    randomness: number; // normalized 0 - 1
    charLength: number; // normalized 0 - 1
    lowerThreshold: number; // normalized 0 - 1
    upperThreshold: number; // normalized 0 - 1
    sortingType: SortingType;
    intervalFunction: IntervalFunction;
};

export type Pixel = [ number, number, number, number ]; // RGBA value
export type PixelList = Pixel[];

export type PixelCanvas = Size & {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};

export type CachedPixelCanvas = PixelCanvas & {
    data: ImageData;
};
