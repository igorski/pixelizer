# pixelizer

A web based image glitching processor that works by "sorting pixels". It takes any provided input image and shuffles
the pixel content according to controllable algorithms to provide a distorted take, hopefully with pleasing results.

Adapted from Python code by [Satyarth Mishra Sharma](https://github.com/satyarth/pixelsort), which in turn was based on
a Processing script by [Kim Asendorf](https://github.com/kimasendorf/ASDFPixelSort).

## TODO

 * Add resize handler
 * Cache rotated image on repeated invocations
 * Move width and height out of settings (or cache original image and allow inline resize...)
 * Group settings field by function
 * Implement drag and drop of image files
 * Include "Edges" algorithm
 * Create save button
 * Add non-aliased mode
 * Add mask support
 * Create save current state fn to keep filtering new passes

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

Running unit tests:

```
npm run test
```

Running TypeScript validation:

```
npm run typecheck
```