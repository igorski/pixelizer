# pixelizer

A web based image glitching processor that works by "sorting pixels". It takes any provided input image and shuffles
the pixel content according to controllable algorithms to provide a distorted take, hopefully with pleasing results.

Adapted from [Python code](https://github.com/satyarth/pixelsort) by Satyarth Mishra Sharma, which in turn was based on
a [Processing script](https://github.com/kimasendorf/ASDFPixelSort) by Kim Asendorf.

## TODO

 * Create undo / redo
 * Waves filter broken at higher resolutions ? (is it the rotation?)
 * Group settings field by function
 * Include "Edges" algorithm
 * Add mask support
 * Mobile view
 * Add button to download image at original (high) resolution

## Project setup

```
npm install
```

### Development

Create a local development server with hot module reload:

```
npm run dev
```

Creating a production build (build output will reside in _./dist/_-folder):

```
npm run build
```

Running TypeScript validation:

```
npm run typecheck
```