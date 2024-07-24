import type { Size } from "@/definitions/types";
import type { PixelCanvas, Pixel } from "@/definitions/types";

export const createCanvas = ( width: number, height: number ): PixelCanvas => {
    const canvas  = document.createElement( "canvas" );
    canvas.width  = width;
    canvas.height = height;

    return {
        canvas,
        context: canvas.getContext( "2d" ),
        width,
        height
    };
};

export const cloneCanvas = ( canvas: PixelCanvas ): PixelCanvas => {
    const output = createCanvas( canvas.width, canvas.height );

    output.context.drawImage( canvas.canvas, 0, 0 );

    return output;
};

export const rotateCanvas = ( canvas: PixelCanvas, angle: number ): PixelCanvas => {
    const { width, height } = canvas;
    const angleRad = angle * ( Math.PI / 180 );

    const rotatedCanvas  = document.createElement( "canvas" );
    const rotatedContext = rotatedCanvas.getContext( "2d" )!;

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

export const convertTo1Bit = ( canvas: PixelCanvas, threshold = 127 ): PixelCanvas => {
    const { width, height } = canvas;

    const output = cloneCanvas( canvas );

    const idata = output.context.getImageData( 0, 0, width, height );
    const buffer = idata.data;
    const length = buffer.length;

    for ( let i = 0; i < length; i += 4 ) {
        // get approx. luma value from RGB
        let luma = buffer[ i ] * 0.3 + buffer[ i + 1 ] * 0.59 + buffer[ i + 2 ] * 0.11;

        // test against some threshold
        luma = luma < threshold ? 0 : 255;

        // write result back to all components
        buffer[ i ] = luma;
        buffer[ i + 1 ] = luma;
        buffer[ i + 2 ] = luma;
    }

    // update canvas with the resulting bitmap data
    output.context.putImageData( idata, 0, 0 );

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