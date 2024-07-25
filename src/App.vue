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
    <section
        ref="canvasWrapper"
        class="app__canvas-wrapper"
        :class="{
            'app__canvas-wrapper--expanded': !collapseMenu
        }"
    >
        <div
            ref="canvasContainer"
            class="app__canvas"
        >
            <div v-if="!hasImage" class="app__file-upload">
                <div
                    v-if="!hasImage"
                    v-t="'main.fileSelectExplanation'"
                    class="app__image-placeholder"
                    @click="openFileSelector()"
                ></div>
                <p class="app__privacy-explanation" v-t="'main.privacy'"></p>
            </div>
        </div>
    </section>
    <div
        class="app__settings"
        :class="{
            'app__settings--collapsed': collapseMenu
        }"
    >
        <button
            class="app__settings__collapse-btn"
            @click="collapseMenu = !collapseMenu"
        >&#9776;</button>
        <section class="file-manager">
            <h1 v-t="'header.title'" class="app__title"></h1>
            <p class="app__description">
                {{ $t('header.description', { title: $t( "header.title" )}) }} <a href="https://github.com/igorski/pixelizer" target="_blank">GitHub</a>
            </p>
            <button
                type="button"
                class="select-button"
                v-t="'header.selectFile'"
                @click="openFileSelector()"
            ></button>
            <button
                type="button"
                class="download-button"
                :disabled="!hasImage"
                v-t="'header.download'"
                @click="downloadImage()"
            ></button>
            <input
                type="file"
                ref="fileInput"
                accept="image/png,image/gif,image/jpeg"
                style="display: none;"
                @change="handleImageSelect( $event )"
            />
        </section>
        <section class="app__controls">
            <Settings
                :has-image="hasImage"
                v-model="settings"
                @restore="restoreState( $event )"
                @save="handleSave()"
            />
        </section>
    </div>
</template>

<script lang="ts">
import debounce from "lodash.debounce";
import { mapActions } from "pinia";
import { Loader } from "zcanvas";
import Settings from "@/components/Settings.vue";
import type { PixelCanvas, SortSettings } from "@/definitions/types";
import { pixelsort } from "@/filters/pixel-sorter";
import { IntervalFunction } from "@/filters/sorter/interval";
import { flushCaches } from "@/filters/sorter/cache";
import { SortingType } from "@/filters/sorter/sorting";
import { useHistoryStore } from "@/store/history";
import { imageToCanvas, canvasToFile, resizeImage } from "@/utils/canvas";
import { handleFileDrag, handleFileDrop } from "@/utils/file";
import { constrainAspectRatio } from "@/utils/math";
import "floating-vue/dist/style.css";

const MAX_IMAGE_SIZE = 1000;

let loadedImage: PixelCanvas | undefined;
let resizedImage: PixelCanvas | undefined;
let sortedImage: PixelCanvas | undefined;
let canvas: HTMLCanvasElement | undefined;
let lastWidth = 0;
let lastHeight = 0;
let blockSave = true; // prevents re-saving when stepping through history states

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
        collapseMenu: true,
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
                if ( !blockSave ) {
                    this.debouncedSave();
                } else {
                    blockSave = false;
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
        this.debouncedSave   = debounce( this.saveState.bind( this ), 1000 );
    },
    methods: {
        ...mapActions( useHistoryStore, [
            "clearHistory",
            "storeHistoryState", 
        ]),
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
            flushCaches();
            this.clearHistory();

            const source = await Loader.loadImage( file );
            loadedImage = imageToCanvas( source );

            this.hasImage = true;
            this.saveState();
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
            const size = constrainAspectRatio( width, height, loadedImage.width, loadedImage.height );
            resizedImage = resizeImage( loadedImage.canvas, size.width, size.height );

            this.runFilter();
        },
        runFilter( hiRes = false ): void {
            if ( resizedImage === undefined ) {
                return;
            }
            const { width, height, ...settings } = this.$data.settings;

            if ( canvas?.parentNode ) {
                this.$refs.canvasContainer.removeChild( canvas );
            }
            try {
                sortedImage = pixelsort({
                    image: hiRes ? loadedImage : resizedImage,
                    ...settings,
                });
                ({ canvas } = sortedImage );
            } catch ( e ) {
                console.error( `Irrecoverable error occurred during sorting: ${e.message}`, e );
            }
            // @todo use zCanvas and pool a Sprite
            if ( !hiRes ) {
                this.$refs.canvasContainer.appendChild( canvas );
            }
        },
        handleResize(): void {
            const availableBounds = this.$refs.canvasWrapper.getBoundingClientRect();

            const scaledValue = Math.min( MAX_IMAGE_SIZE, Math.floor( availableBounds.height * 0.9 ));

            this.$data.settings.width  = scaledValue;
            this.$data.settings.height = scaledValue;
        },
        handleSave(): void {
            // this.runFilter( true ); // only if we want to apply onto the (large) original image
            loadedImage = sortedImage;
            this.resizeSource();
            this.runFilter();
        },
        downloadImage(): void {
            canvasToFile( canvas, "generated.png" );
        },
        restoreState( settings: SortSettings ): void {
            console.info("restore to this:", settings );
            blockSave = true;
            this.$data.settings = settings;
        },
        saveState(): void {
            this.storeHistoryState( this.$data.settings );
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

.app__canvas canvas {
    box-shadow: 0 8px 8px rgba(0,0,0,.5);
}
</style>

<style lang="scss">
@import "@/styles/_mixins";

.app {
    &__canvas-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        min-height: 100%;
    }

    &__title {
        margin: 0;
    }

    &__description {
        font-size: 0.75em;
    }

    &__canvas-wrapper {
        flex: 1;
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: row;
        overflow: hidden;

        &--expanded {
            @include mobile() {
                width: 100%;
            }
        }
    }

    &__settings {
        position: fixed;
        display: flex;
        flex-direction: column;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        border-left: 4px solid $color-4;
        box-sizing: border-box;
        padding: $spacing-medium $spacing-large;
        background-color: #333;
        user-select: none;
        @include animate(right, 0.7s);

        &--collapsed {
            @include mobile() {
                right: -100%;
            }
        }

        &__collapse-btn {
            @include button( false );
            border-radius: 50%;
            padding: $spacing-small ($spacing-medium - $spacing-xsmall);
            position: fixed;
            top: $spacing-small;
            right: $spacing-small;
        }
    }

    &__controls {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        margin-top: $spacing-small;
        overflow-y: scroll;
    }

    &__file-upload {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 320px;
        text-align: center;
        margin: 0 auto;
    }

    &__image-placeholder {
        cursor: pointer;
        border-radius: $spacing-xlarge;
        padding: $spacing-xlarge;
        border: 3px solid #b6b6b6;
        font-size: 1.25em;
        user-select: none;

        &:hover {
            border-color: $color-1;
            color: #FFF;
        }
    }

    &__privacy-explanation {
        margin-top: $spacing-medium;
        font-size: 0.85em;
    }

    @include large() {
        $sideBarWidth: 370px;

        &__canvas-wrapper {
            width: calc( 100% - $sideBarWidth );
        }
        
        &__settings {
            width: $sideBarWidth;

            &__collapse-btn {
                display: none;
            }
        }
    }
}

.select-button {
    @include button();
}

.download-button {
    @include button( false );
}
</style>