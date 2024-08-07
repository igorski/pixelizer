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

// Sobel operator used for the edge detection https://en.wikipedia.org/wiki/Sobel_operator

const SOBEL_X = [
    [ -1, 0, 1 ],
    [ -2, 0, 2 ],
    [ -1, 0, 1 ]
];

const SOBEL_Y = [
    [ -1, -2, -1 ],
    [ 0,  0,  0 ],
    [ 1,  2,  1 ]
];

/**
 * Create a new bitmap that contains all detected edges found in provided input image.
 * Threshold is an 8-bit value between 0 - 255
 */
export const findEdges = ( image: CachedPixelCanvas, threshold = 127 ): ImageData => {
    return createEdgeImageData( image.data, threshold );
};

/* internal methods */

function edgeDetection( imageData: ImageData, threshold: number ): number[][] {
    const { width, height, data } = imageData;
  
    // 1. convert the image to grayscale
    const grayscale = new Array( height ).fill( 0 ).map(() => new Array( width ).fill( 0 ));
    
    for ( let y = 0; y < height; ++y ) {
        for ( let x = 0; x < width; ++x ) {
            const index = ( y * width + x ) * 4;
            const r = data[ index ];
            const g = data[ index + 1 ];
            const b = data[ index + 2 ];
            grayscale[ y ] [ x ] = ( r + g + b ) / 3;
        }
    }

    // 2. calculate the magnitude / strength of the edges of each pixel
    // higher values indicate stronger edges (greater change in intensity)
    // while lower values indicate weaker edges (less change in intensity)
    const magnitude = new Array( height ).fill( 0 ).map(() => new Array( width ).fill( 0 ));
  
    for ( let y = 1; y < height - 1; ++y ) {
        for ( let x = 1; x < width - 1; ++x ) {
            let gx = 0;
            let gy = 0;

            for  (let ky = -1; ky <= 1; ++ky ) {
                for ( let kx = -1; kx <= 1; ++kx ) {
                    gx += grayscale[ y + ky ][ x + kx ] * SOBEL_X[ ky + 1 ][ kx + 1 ];
                    gy += grayscale[ y + ky ][ x + kx ] * SOBEL_Y[ ky + 1 ][ kx + 1 ];
                }
            }
            magnitude[ y ][ x ] = Math.sqrt( gx * gx + gy * gy );
        }
    }
  
    // 3. apply a threshold to the magnitude to get binary edge points
    const edges = new Array( height ).fill( 0 ).map(() => new Array( width ).fill( 0 ));
  
    for ( let y = 0; y < height; ++y ) {
        for ( let x = 0; x < width; ++x ) {
            edges[ y ][ x ] = magnitude[ y ][ x ] > threshold ? 1 : 0;
        }
    }
    return edges;
}
  
function createEdgeImageData( imageData: ImageData, threshold: number ): ImageData {
    const edges = edgeDetection( imageData, threshold );

    const { width, height } = imageData;
    const edgeImageData = new ImageData( width, height );

    for ( let y = 0; y < height; ++y ) {
        for ( let x = 0; x < width; ++x ) {
            const index = ( y * width + x ) * 4;
            const value = edges[ y ][ x ] * 255;
            edgeImageData.data[ index ] = value;
            edgeImageData.data[ index + 1 ] = value;
            edgeImageData.data[ index + 2 ] = value;
            edgeImageData.data[ index + 3 ] = 255;
        }
    }
    return edgeImageData;
}
  