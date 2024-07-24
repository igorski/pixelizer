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

/**
 * when stretching, the non-dominant side of the preferred rectangle will scale to reflect the
 * ratio of the available space, while the dominant side remains at its current size.
 */
export function constrainAspectRatio( containerWidth: number, containerHeight: number, imageWidth: number, imageHeight: number ): Size {
    const imageAspectRatio     = imageWidth / imageHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let newWidth;
    let newHeight;

    if ( imageAspectRatio > containerAspectRatio ) {
        // Image is wider relative to its height than the container
        newWidth  = containerWidth;
        newHeight = containerWidth / imageAspectRatio;
    } else {
        // Image is taller relative to its width or perfectly proportional
        newHeight = containerHeight;
        newWidth  = containerHeight * imageAspectRatio;
    }

    return {
        width: newWidth,
        height: newHeight
    };
}