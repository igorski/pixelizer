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
import type { PixelCanvas, Pixel } from "@/definitions/types";

export const createCanvas = ( width: number, height: number, crisp = false ): PixelCanvas => {
    const canvas  = document.createElement( "canvas" );
    canvas.width  = width;
    canvas.height = height;

    const context = canvas.getContext( "2d", { willReadFrequently: true });

    if ( crisp ) {
        removeAntiAlias( canvas, context );
    }

    return {
        canvas,
        context,
        width,
        height,
    };
};

export const cloneCanvas = ( canvas: PixelCanvas ): PixelCanvas => {
    const output = createCanvas( canvas.width, canvas.height );

    output.context.drawImage( canvas.canvas, 0, 0 );

    return output;
};

export const cropCanvas = ( canvas: PixelCanvas, width: number, height: number, crisp = false ): PixelCanvas => {
    const output = createCanvas( width, height );

    if ( crisp ) {
        removeAntiAlias( output.canvas, output.context );
    }

    const deltaX = canvas.width  / 2 - width / 2;
    const deltaY = canvas.height / 2 - height / 2;

    output.context.drawImage( canvas.canvas, deltaX, deltaY, width, height, 0, 0, width, height );

    return output;
};

export const rotateCanvas = ( canvas: PixelCanvas, angle: number ): PixelCanvas => {
    const { width, height } = canvas;
    const angleRad = angle * ( Math.PI / 180 );

    const rotatedCanvas  = document.createElement( "canvas" );
    const rotatedContext = rotatedCanvas.getContext( "2d", { willReadFrequently: true })!;

    const rotatedWidth  = Math.round( Math.abs( width  * Math.cos( angleRad )) + Math.abs( height * Math.sin( angleRad )));
    const rotatedHeight = Math.round( Math.abs( height * Math.cos( angleRad )) + Math.abs( width  * Math.sin( angleRad )));
    
    rotatedCanvas.width  = rotatedWidth;
    rotatedCanvas.height = rotatedHeight;

    rotatedContext.translate( rotatedWidth / 2, rotatedHeight / 2 );
    rotatedContext.rotate( angleRad );

    rotatedContext.drawImage( canvas.canvas, -width / 2, -height / 2 );

    return {
        canvas: rotatedCanvas,
        context: rotatedContext,
        width: rotatedWidth,
        height: rotatedHeight
    };
};

export const imageToCanvas = ( image: { size: Size, image: HTMLImageElement } ): PixelCanvas => {
    const canvas = createCanvas( image.size.width, image.size.height );

    canvas.context.drawImage( image.image, 0, 0 );

    return canvas;
};

export const canvasToFile = ( canvas: HTMLCanvasElement, fileName: string ): void => {
    const snapshot = canvas!.toDataURL( "image/png" );
    const downloadLink = document.createElement( "a" );
    downloadLink.setAttribute( "download", fileName );
    downloadLink.setAttribute( "href", snapshot.replace(/^data:image\/png/, "data:application/octet-stream" ));
    downloadLink.click();
};

export const resizeImage = ( image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width?: number, height?: number ): PixelCanvas => {
    width  = width  ?? image.width;
    height = height ?? image.height;

    const output = createCanvas( width, height );

    output.context.drawImage( image, 0, 0, width, height );

    return output;
};

export const getIndex = ( imageData: ImageData, x: number, y: number ): number => {
    return ( y * imageData.width + x ) * 4;
};

export const getPixel = ( imageData: ImageData, x: number, y: number ): Pixel | undefined => {
    const index = getIndex( imageData, x, y );

    if ( index >= imageData.data.length ) {
        return undefined;
    }

    return [
        imageData.data[ index ],
        imageData.data[ index + 1 ],
        imageData.data[ index + 2 ],
        imageData.data[ index + 3 ],
    ];
};

export const setPixel = ( imageData: ImageData, x: number, y: number, pixel: Pixel ): boolean => {
    const index = getIndex( imageData, x, y );

    if ( index >= imageData.data.length ) {
        return false;
    }

    imageData.data[ index ]     = pixel[ 0 ];
    imageData.data[ index + 1 ] = pixel[ 1 ];
    imageData.data[ index + 2 ] = pixel[ 2 ];
    imageData.data[ index + 3 ] = pixel[ 3 ];

    return true;
};

function removeAntiAlias( canvas: HTMLCanvasElement, context: CanvasRenderingContext2D ): void {
    [ "-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges" ]
        .forEach( style => {
            // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
            canvas.style[ "image-rendering" ] = style;
        });

    const props = [
        "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
        "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"
    ];
    
    props.forEach( prop => {
        // @ts-expect-error TS7053 expression of type 'string' can't be used to index type CanvasRenderingContext2D
        if ( context[ prop ] !== undefined ) context[ prop ] = true;
    });
}