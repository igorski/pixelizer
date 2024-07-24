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
import type { PixelCanvas } from "@/definitions/types";
import { cloneCanvas } from "@/utils/canvas";

/**
 * Creates a 1-bit (black and white) representation of given canvas.
 * Threshold is an 8-bit value between 0 - 255
 */
export const applyThreshold = ( canvas: PixelCanvas, threshold = 127 ): PixelCanvas => {
    const { width, height } = canvas;

    threshold = Math.max( 0, Math.min( 255, threshold ));

    const output = cloneCanvas( canvas );

    const imageData = output.context.getImageData( 0, 0, width, height );
    const { data } = imageData;

    for ( let i = 0, l = data.length; i < l; i += 4 ) {
        if ( data[ i + 3 ] === 0 ) {
            continue; // pixel is transparent
        }
        let luma = data[ i ] * 0.3 + data[ i + 1 ] * 0.59 + data[ i + 2 ] * 0.11;

        luma = luma < threshold ? 0 : 255;

        data[ i ] = luma;
        data[ i + 1 ] = luma;
        data[ i + 2 ] = luma;
    }
    output.context.putImageData( imageData, 0, 0 );

    return output;
};