/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020-2024 - https://www.igorski.nl
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
type ImageType = {
    mime: string;
    ext: string;
};

export const JPEG: ImageType = { mime: "image/jpeg", ext: "jpg" };
export const PNG : ImageType = { mime: "image/png",  ext: "png" };
export const GIF : ImageType = { mime: "image/gif",  ext: "gif" };
export const WEBP: ImageType = { mime: "image/webp", ext: "webp" };

export const ALL_IMAGE_TYPES = [ JPEG, PNG, GIF/*, WEBP*/ ];

// 2. all image formats supported by all supported platforms

export const ACCEPTED_IMAGE_TYPES      = [ JPEG.mime, PNG.mime, GIF.mime ];
export const ACCEPTED_IMAGE_EXTENSIONS = [ JPEG.ext, "jpeg", PNG.ext, GIF.ext ];

export const handleFileDrag = ( event: Event ): void => {
    event.stopPropagation();
    event.preventDefault();
    // @ts-expect-error dataTransfer unknown type
    event.dataTransfer.dropEffect = "copy";
};

export const handleFileDrop = ( event: Event ): File | undefined => {
    event.preventDefault();
    event.stopPropagation();

    // @ts-expect-error Type 'FileList' is not an array type (but it destructures just fine...)
    const items = event.dataTransfer ? [ ...event.dataTransfer.files ] : [];
    // @ts-expect-error
    const [ file ] = items.filter( file => ACCEPTED_IMAGE_TYPES.includes( file.type ));

    return file;
}