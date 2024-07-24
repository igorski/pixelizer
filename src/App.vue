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
    <header class="app-header">
        <h1>Pixelizer</h1>
        <section class="file-manager">
            <button
                type="button"
                @click="openFileSelector( $event )"
            >Select file</button>
            <input
                type="file"
                ref="fileInput"
                accept="image/png,image/gif,image/jpeg"
                style="display: none;"
                @change="handleImageSelect( $event )"
            />
        </section>
    </header>
    <section class="app-ui">
        <div ref="canvasWrapper" class="app-ui__canvas-wrapper">
            <div
                ref="canvasContainer"
                class="app-ui__canvas"
            ></div>
        </div>
        <div class="app-ui__settings">
            <Settings
                v-model="settings"
            />
        </div>
    </section>
</template>

<script lang="ts">
import { Loader } from "zcanvas";
import Settings from "@/components/Settings.vue";
import type { PixelCanvas } from "@/definitions/types";
import { pixelsort } from "@/filters/pixel-sorter";
import { IntervalFunction } from "@/filters/sorter/interval";
import { SortingType } from "@/filters/sorter/sorting";
import { resizeImage } from "@/utils/canvas";
import { constrainAspectRatio } from "@/utils/math";

let resizedImage: PixelCanvas | undefined;
let canvas: HTMLCanvasElement | undefined;
let rafPending = false;

export default {
    components: {
        Settings,
    },
    data: () => ({
        settings: {
            width: 400,
            height: 400,
            angle: 0,
            randomness: 0,
            charLength: 0.5,
            lowerThreshold: 0.25,
            upperThreshold: 0.8,
            sortingType: SortingType.LIGHTNESS,
            intervalFunction: IntervalFunction.THRESHOLD,
        },
    }),
    watch: {
        settings: {
            deep: true,
            handler(): void {
                if ( rafPending ) {
                    return; // a filter render request is already pending
                }
                rafPending = true;
                window.requestAnimationFrame(() => {
                    this.runFilter();
                    rafPending = false;
                });
            }
        }
    },
    mounted(): void {
        const availableBounds = this.$refs.canvasWrapper.getBoundingClientRect();

        const value = Math.floor( Math.min( availableBounds.width, availableBounds.height ));

        this.$data.settings.width  = value;
        this.$data.settings.height = value;
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
            const files = event.target!.files;
            if ( !files || files.length === 0 ) {
                return;
            }
            const [ file ] = files;
            const loadedImage = await Loader.loadImage( file );

            const { width, height } = this.$data.settings;
            
            // resize image (maintaining its aspect ratio) to desired width and height
            const size = constrainAspectRatio( width, height, loadedImage.size.width, loadedImage.size.height );
            resizedImage = resizeImage( loadedImage.image, size.width, size.height );

            this.runFilter();
        },
        runFilter(): void {
            if ( resizedImage === undefined ) {
                return;
            }
            const { width, height, ...settings } = this.$data.settings;

            if ( canvas?.parentNode ) {
                this.$refs.canvasContainer.removeChild( canvas );
            }
            try {
                ({ canvas } = pixelsort({
                    image: resizedImage,
                    ...settings,
                }));
            } catch ( e ) {
                if ( this.$data.settings.angle === 0 ) {
                    this.$data.settings.angle = 90;
                    return this.runFilter();
                }
                console.error( `Irrecoverable error occurred during sorting: ${e.message}` );
            }
            this.$refs.canvasContainer.appendChild( canvas );
        },
    },
};
</script>

<style lang="scss">
html, body {
    overscroll-behavior-x: none; /* disable navigation back/forward swipe on Chrome */
    height: 100%;
}

body {
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #333;
    color: #b6b6b6;
}

#app {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    justify-content: space-around;
}

.app-ui {
    flex: 1;
    display: flex;
    justify-content: space-between;

    &__canvas-wrapper {
        flex: 0.7;
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row;
    }

    &__canvas {
        canvas {
            box-shadow: 0 8px 8px rgba(0,0,0,.5);
            vertical-align: middle;
        }
    }

    &__settings {
        flex: 0.3;
        height: inherit;
        border-left: 2px solid blue;
        box-sizing: border-box;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}
</style>