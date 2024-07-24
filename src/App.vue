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
<template>
    <h1>Pixelizer</h1>
    <button type="button" @click="openFileSelector( $event )">Select file</button>
    <input type="file" id="file"
        ref="fileInput"
        accept="image/png,image/gif,image/jpeg"
        style="display: none;"
        @change="handleImageSelect"
    />
    <div ref="canvasContainer" class="canvas-container"></div>
</template>

<script lang="ts">
import { Loader } from "zcanvas";
import { imageToCanvas } from "./utils/canvas";
import { pixelsort } from "./utils/main";

export default {
    components: {
    },
    data: () => ({
        interval_function: "threshold",
        lower_threshold: 0.25,
        upper_threshold: 0.8,
        char_length: 50,
        angle: 0,
        randomness: 0,
        sorting_function: "lightness",
    }),
    computed: {
       
    },
    async mounted(): Promise<void> {

    },
    methods: {
        openFileSelector( event: Event ): void {
            // this is just some hackaroni to trigger the file selector from the
            // hidden file input. File inputs look uglier than buttons...
            const simulatedEvent = document.createEvent( "MouseEvent" );
            simulatedEvent.initMouseEvent(
                "click", true, true, window, 1,
                0, 0, 0, 0, false,
                false, false, false, 0, null
            );
            this.$refs.fileInput.dispatchEvent( simulatedEvent );
        },
        async handleImageSelect( event: Event ): Promise<void> {
            const files = event.target.files;
            if ( !files || files.length === 0 ) {
                return;
            }
            const [ file ] = files;
            const sizedImage = await Loader.loadImage( file );

            const canvas = pixelsort({
                image: imageToCanvas( sizedImage ),
                angle: 0,
                // randomness: 50,
                // sortingFunction: "saturation",
                // intervalFunction: "threshold"
            });
            this.$refs.canvasContainer.appendChild( canvas.canvas );
        }
    },
};
</script>

<style lang="scss">
html, body {
    overscroll-behavior-x: none; /* disable navigation back/forward swipe on Chrome */
}

body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #333;
    color: #b6b6b6;
}

.canvas-container {
    canvas {
        height: 400px;
    }
}
</style>