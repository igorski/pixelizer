# pixelizer

A web based image glitching processor that works by "sorting pixels". It takes any provided input image and shuffles
the pixel content according to controllable algorithms to provide a distorted take, hopefully with pleasing results.

Adapted from [Python code](https://github.com/satyarth/pixelsort) by Satyarth Mishra Sharma, which in turn was based on
a [Processing script](https://github.com/kimasendorf/ASDFPixelSort) by Kim Asendorf.

The UI is built using Vue, but the majority of the inner workings is pure TypeScript. There is some overlap in
functionality with [BitMappery](https://github.com/igorski/bitmappery), but this is chosen to be a separate toy, at
least for the time being.

## TODO

 * Filters do not work full width of on landscape images when angle is at exactly 90 degrees
 * Include "Edges" algorithm
 * Add loading of mask support
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

Running unit tests

```
npm run test
```

Running TypeScript validation:

```
npm run typecheck
```