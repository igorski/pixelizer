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
    <section class="app-ui">
        <header class="app-ui__header">
            <h1>Pixelizer</h1>
            <section class="file-manager">
                <button
                    type="button"
                    class="select-button"
                    @click="openFileSelector()"
                >Select file</button>
                <button
                    v-if="hasImage"
                    type="button"
                    class="download-button"
                    @click="downloadImage()"
                >Download</button>
                <input
                    type="file"
                    ref="fileInput"
                    accept="image/png,image/gif,image/jpeg"
                    style="display: none;"
                    @change="handleImageSelect( $event )"
                />
            </section>
        </header>
        <div ref="canvasWrapper" class="app-ui__canvas-wrapper">
            <div
                ref="canvasContainer"
                class="app-ui__canvas"
            >
                <div
                    v-if="!hasImage"
                    class="app-ui__image-placeholder"
                    @click="openFileSelector()"
                >Select a file or drag an image into this window</div>
            </div>
        </div>
    </section>
    <div class="app-ui__settings">
        <Settings
            v-model="settings"
        />
    </div>
</template>

<script lang="ts">
import debounce from "lodash.debounce";
import { Loader } from "zcanvas";
import Settings from "@/components/Settings.vue";
import type { PixelCanvas, SortSettings } from "@/definitions/types";
import { pixelsort } from "@/filters/pixel-sorter";
import { IntervalFunction } from "@/filters/sorter/interval";
import { SortingType } from "@/filters/sorter/sorting";
import { resizeImage } from "@/utils/canvas";
import { handleFileDrag, handleFileDrop } from "@/utils/file";
import { constrainAspectRatio } from "@/utils/math";

const MAX_IMAGE_SIZE = 1000;

let loadedImage: PixelCanvas | undefined;
let resizedImage: PixelCanvas | undefined;
let canvas: HTMLCanvasElement | undefined;
let lastWidth = 0;
let lastHeight = 0;

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
        hasImage: false,
    }),
    watch: {
        settings: {
            deep: true,
            handler( data: SortSettings ): void {
                if ( data.width !== lastWidth || data.height !== lastHeight ) {
                    this.debouncedResize();
                } else {
                    this.debouncedFilter();
                }
            }
        }
    },
    mounted(): void {
        // no need to remove the listeners below as we will require these throughout the application lifetime
        window.addEventListener( "resize", this.handleResize.bind( this ));
        window.addEventListener( "dragover", handleFileDrag, false );
        window.addEventListener( "drop", event => {
            const file = handleFileDrop( event );
            file && this.loadFile( file );
        }, false );
        
        this.handleResize();

        this.debouncedResize = debounce( this.resizeSource.bind( this ), 16 );
        this.debouncedFilter = debounce( this.runFilter.bind( this ), 16 );
    },
    methods: {
        openFileSelector(): void {
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
        handleImageSelect( event: Event ): void {
            const files = ( event.target as HTMLInputElement )!.files;
            if ( !files || files.length === 0 ) {
                return;
            }
            const [ file ] = files;
            this.loadFile( file );
        },
        async loadFile( file: File ): Promise<void> {
            loadedImage = await Loader.loadImage( file );

            this.hasImage = true;
            this.resizeSource();
        },
        resizeSource(): void {
            if ( !loadedImage ) {
                return;
            }
            const { width, height } = this.$data.settings;

            lastWidth  = width;
            lastHeight = height;
            
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
        handleResize(): void {
            const availableBounds = this.$refs.canvasWrapper.getBoundingClientRect();

            const scaledValue = Math.min( MAX_IMAGE_SIZE, Math.floor(( availableBounds.height * 0.9 ) / 100 ) * 100 );

            this.$data.settings.width  = scaledValue;
            this.$data.settings.height = scaledValue;
        },
        downloadImage(): void {
            const snapshot = canvas!.toDataURL( "image/png" );
            const downloadLink = document.createElement( "a" );
            downloadLink.setAttribute( "download", "generated.png" );
            downloadLink.setAttribute( "href", snapshot.replace(/^data:image\/png/, "data:application/octet-stream" ));
            downloadLink.click();
        },
    },
};
</script>

<style lang="scss">
// set global styles (typography, page layout, etc.)
// beyond this point all styling should be scoped
@import "@/styles/_global";

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: $color-2;
    height: 100%;
}

.app-ui__canvas canvas {
    box-shadow: 0 8px 8px rgba(0,0,0,.5);
}
</style>

<style lang="scss">
@import "@/styles/_mixins";

$sideBarWidth: 360px;

.app-ui {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: calc( 100% - $sideBarWidth );
    min-height: 100%;

    &__header {
        padding: $spacing-small $spacing-medium;
        box-sizing: border-box;
        width: 100%;
    }

    &__canvas-wrapper {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row;
        overflow: hidden;
    }

    &__settings {
        position: fixed;
        top: 0;
        right: 0;
        width: $sideBarWidth;
        height: 100%;
        border-left: 4px solid $color-4;
        box-sizing: border-box;
        padding: $spacing-medium $spacing-large;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: #333;
    }

    &__image-placeholder {
        cursor: pointer;
        border-radius: $spacing-xlarge;
        padding: $spacing-xlarge;
        border: 3px solid #b6b6b6;
        font-size: 1.25em;
        user-select: none;
    }
}

.select-button {
    @include button();
}

.download-button {
    @include button();
    background-color: $color-1;

    &:hover {
        background-color: $color-4;
    }
}
</style>