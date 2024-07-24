export type Size = {
    width: number;
    height: number;
};

export type PixelCanvas = Size & {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};

export type RGBA = [ number, number, number, number ];
export type Pixel = RGBA;
export type PixelList = Pixel[];

export type CoordinateList = number[][]; // first dimension is y-coordinate, second dimension is x-coordinate
