/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2024 - https://www.igorski.nl
 * 
 * Adapted from code by https://www.pepperoni.blog/canvas-kaleidoscope/
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
import { cacheCanvas, createCanvas } from "@/utils/canvas";

interface KaleidoscopeParams {
    image: CachedPixelCanvas;
    size: number;
}

// todo before caching base image so we don't need to call this multiple times!

export const applyKaleidoscope = async ({ image, size = 150 }: KaleidoscopeParams ): Promise<CachedPixelCanvas> => {
    const patDim = size;
    const SqrtOf3_4 = Math.sqrt(3)/2;
    const height = SqrtOf3_4 * patDim;

    const clone = createCanvas( image.width, image.height );

    // draw mirrored version of the image
    clone.context.save();
    clone.context.translate( image.width, 0 );
    clone.context.scale(-1, 1);
    clone.context.drawImage( image.canvas, 0, 0 );
    clone.context.restore();

    const output = createCanvas( image.width, image.height );
    const c = output.canvas;
    const ctx = output.context;

    const pat = ctx.createPattern( image.canvas, "repeat");
    const patR = ctx.createPattern( clone.canvas, "repeat");

    let offset = 0;

    ctx.translate(-0.5*patDim, 0);

    const fn = function( alternateMode: boolean ): void {
        offset = ( offset - 1 ) % 1024;
        var i = 0;

        //draw kaleidoscope first row.
        ctx.save();
        ctx.fillStyle=pat;
        ctx.translate(0, offset);
        
        while( i <= 3 ) {
            ctx.beginPath();
            ctx.moveTo(0,-offset);
            ctx.lineTo(patDim, -offset);
            ctx.lineTo(0.5*patDim, height-offset);
            ctx.closePath();
            ctx.fill();

            const mod = i % 3;

            if ( mod === 0 ) {
                ctx.translate(patDim,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-patDim,offset);
            }
            else if ( mod === 1 ) {
                if ( alternateMode ) {
                    ctx.rotate(120*Math.PI/180);
                    ctx.translate(-3*patDim, 0);
                    ctx.rotate(-120*Math.PI/180);
                }
                ctx.translate(0.5*patDim, height-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-0.5*patDim, -height+offset);
            }
            else if( mod === 2 ) {
                ctx.translate(0,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(0,offset);
            }
            i++;
        }
        ctx.restore();
        ctx.save();
        ctx.scale(-1,-1);
        ctx.fillStyle=patR;
        ctx.translate((-i+(i%3==0?0.5:i%3==1?1.5:-0.5))*patDim, -height+offset);
        ctx.translate(0, -offset);
        ctx.rotate(120*Math.PI/180);
        ctx.translate(0, offset);
        var j=0;

        while(j < i+1){
            ctx.beginPath();

            if( j > 0 || !alternateMode ) {
                ctx.moveTo(0,-offset);
                ctx.lineTo(patDim, -offset);
                ctx.lineTo(0.5*patDim, height-offset);
                ctx.closePath();
                ctx.fill();
            }
            const mod = j % 3;

            if( mod === 1 ) {
                ctx.translate(patDim,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-patDim,offset);
            }
            else if( mod === 2 ) {
                ctx.translate(0.5*patDim, height-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(-0.5*patDim, -height+offset);
            }
            else if( mod === 0 ) {
                ctx.translate(0,-offset);
                ctx.rotate(-120*Math.PI/180);
                ctx.translate(0,offset);
            }
            j++;
        }
        ctx.restore();
    };

    const patternHeight = Math.floor( SqrtOf3_4 * patDim * 2 );

    const tile = function() {
        var rowData = ctx.getImageData( 0, 0, patDim * 3, patternHeight );
        for( let i = 0; patternHeight * i < c.height + SqrtOf3_4 * patDim; i++ ) {
            for( let j = 0; j * patDim < c.width + patDim; j += 3 ) {
                ctx.putImageData( rowData, j * patDim, i * patternHeight );
            }
        }
    };

    fn( false );
    ctx.translate( 1.5 * patDim, height );
    fn( true );
    ctx.translate( -1.5 * patDim, -height );
    tile();

    return cacheCanvas( output );
};
