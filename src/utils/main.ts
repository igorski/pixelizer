import type { PixelCanvas, PixelList, Size } from "@/definitions/types";
import { createCanvas, cloneCanvas, rotateCanvas, getPixel, setPixel, convertTo1Bit } from "@/utils/canvas";
import { getIntervals, IntervalFunction } from "@/utils/interval";
import { sortImage } from "@/utils/sorter";
import { getSortingFunction, SortingType } from "@/utils/sorting";

interface PixelSortParams {
    image: PixelCanvas;
    maskImage?: PixelCanvas;
    intervalImage?: PixelCanvas;
    randomness?: number;
    charLength?: number;
    sortingFunction?: SortingType,
    intervalFunction?: IntervalFunction;
    lowerThreshold?: number; // normalized 0 - 1 range
    upperThreshold?: number; // normalized 0 - 1 range
    angle?: number;
}

/**
 *     :param image: image to pixelsort
    :param mask_image: Image used for masking parts of the image.
    :param interval_image: Image used to define intervals. Must be black and white.
    :param randomness: What percentage of intervals *not* to sort. 0 by default.
    :param char_length:	Characteristic length for the random width generator. Used in mode `random` and `waves`.
    :param sorting_function: Sorting function to use for sorting the pixels.
    :param interval_function: Controls how the intervals used for sorting are defined.
    :param lower_threshold: How dark must a pixel be to be considered as a 'border' for sorting? Takes values from 0-1.
        Used in edges and threshold modes.
    :param upper_threshold: How bright must a pixel be to be considered as a 'border' for sorting? Takes values from
        0-1. Used in threshold mode.
    :param angle: Angle at which you're pixel sorting in degrees.
    :return: pixelsorted image
 */
export const pixelsort = ({ image, maskImage, intervalImage, randomness = 0, charLength = 50,
    sortingFunction = SortingType.LIGHTNESS, intervalFunction = IntervalFunction.THRESHOLD,
    lowerThreshold = 0.25, upperThreshold = 0.8, angle = 0 }: PixelSortParams ): PixelCanvas => {

    const original = image;
    const rotate   = ( angle % 360 ) !== 0;
    const hasMask  = !!maskImage;

    const { width, height } = original;
    const size = { width, height };
    
    if ( rotate ) {
        image = rotateCanvas( cloneCanvas( image ), angle );
    }
    const imageData = image.context.getImageData( 0, 0, width, height );
    
    maskImage = maskImage ?? createCanvas( image.width, image.height );
    maskImage = rotateCanvas( convertTo1Bit( maskImage ), angle );

    const maskData = maskImage.context.getImageData( 0, 0, maskImage.width, maskImage.height );
    
    console.info("Determining intervals...");

    const intervals = getIntervals( intervalFunction, {
        image,
        lowerThreshold,
        upperThreshold,
        charLength,
        intervalImage,
    });

    console.info("Sorting pixels...");
    
    const sortedPixels = sortImage({
        size,
        imageData,
        maskData,
        intervals,
        randomness,
        sortingFunction: getSortingFunction( sortingFunction )
    });

    let output = placePixels(
        sortedPixels,
        imageData,
        size,
        maskData,
    );
    
    if ( rotate ) {
       output = rotateCanvas( output, angle );
    }

    console.info("Done!");

    return output;
}

function placePixels( pixels: PixelList[], original: ImageData, size: Size, mask?: ImageData ): PixelCanvas {
    const { width, height } = size;

    const output = createCanvas( width, height );
    const outputdata = output.context.getImageData( 0, 0, width, height );

    for ( let y = 0; y < height; ++y ) {
        let count = 0;
        for ( let x = 0; x < width; ++x ) {
            if ( mask && getPixel( mask, x, y )) {
                setPixel( outputdata, x, y, pixels[ y ][ count ]);
                ++count;
            } else {
                setPixel( outputdata, x, y, getPixel( original, x, y ));
            }
        }
    }
    output.context.putImageData( outputdata, 0, 0 );

    return output;
}
