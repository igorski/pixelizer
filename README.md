# pixelizer

A web based image glitching processor that works by "sorting pixels". It takes any provided input image and shuffles
the pixel content according to controllable algorithms to provide a distorted take, hopefully with pleasing results.

Adapted from [Python code](https://github.com/satyarth/pixelsort) by Satyarth Mishra Sharma, which in turn was based on
a [Processing script](https://github.com/kimasendorf/ASDFPixelSort) by Kim Asendorf.

## TODO

 * Waves filter broken at higher resolutions ? (needs to be multiple of 100...)
 * Cache rotated image on repeated invocations
 * Group settings field by function
 * Include "Edges" algorithm
 * Add mask support
 * Mobile view
 * Create save current state fn to keep filtering new passes over affected image

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