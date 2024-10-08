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
    >
        <div
            ref="canvasContainer"
            class="app__canvas"
            :class="{
                'app__canvas--expanded': !collapseMenu
            }"
        >
            <div v-if="!hasImage" class="app__file-upload">
                <div
                    v-t="'main.fileSelectExplanation'"
                    class="app__image-placeholder"
                    @click="openFileSelector()"
                ></div>
                <p class="app__privacy-explanation" v-t="'main.privacy'"></p>
            </div>
        </div>
        <ProgressBar />
        <Notifications />
    </section>
    <div
        class="app__sidebar"
        :class="{
            'app__sidebar--collapsed': collapseMenu
        }"
    >
        <section class="app__sidebar__header">
            <h1 v-t="'header.title'" class="app__title"></h1>
            <button
                class="app__sidebar__collapse-btn"
                @click="collapseMenu = !collapseMenu"
            >&#9776;</button>
        </section>
        <section class="app__sidebar__body">
            <section class="app__sidebar__file-manager">
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
                    :accept="acceptedFileTypes"
                    style="display: none;"
                    @change="handleImageSelect( $event )"
                />
            </section>
            <section class="app__settings">
                <Settings
                    @import-mask="importMask()"
                    @clear-mask="clearMask()"
                    @save-image="saveImage()"
                    @save-state="saveState()"
                />
            </section>
        </section>
    </div>
</template>

<script lang="ts">
import debounce from "lodash.debounce";
import { mapState, mapActions } from "pinia";
import { Loader } from "zcanvas";
import Notifications from "@/components/notifications/Notifications.vue";
import ProgressBar from "@/components/progress-bar/ProgressBar.vue";
import Settings from "@/components/settings/Settings.vue";
import { EXECUTION_BUDGET, MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/definitions/config";
import type { PixelCanvas, CachedPixelCanvas, SortSettings } from "@/definitions/types";
import { flushCaches } from "@/filters/sorter/cache";
import { applyFilters } from "@/services/render-service";
import { useFileStore } from "@/store/file";
import { useHistoryStore } from "@/store/history";
import { useSettingsStore } from "@/store/settings";
import { useSystemStore } from "@/store/system";
import { imageToCanvas, canvasToFile, cacheCanvas, resizeCanvas, createCanvasFromPattern } from "@/utils/canvas";
import { handleFileDrag, handleFileDrop, } from "@/utils/file";
import { settingToString } from "@/utils/string";
import { constrainAspectRatio } from "@/utils/math";

// we store these locally instead of the Pinia store as they needn't be reactive
let loadedImage: PixelCanvas | undefined;
let resizedImage: CachedPixelCanvas | undefined;
let loadedMask: PixelCanvas | undefined;
let resizedMask: CachedPixelCanvas | undefined;
let sortedImage: PixelCanvas | undefined;
let canvas: HTMLCanvasElement | undefined;
let lastWidth = 0;
let lastHeight = 0;

export default {
    components: {
        Notifications,
        ProgressBar,
        Settings,
    },
    data: () => ({
        collapseMenu: true,
        acceptedFileTypes: ACCEPTED_IMAGE_TYPES.join( "," ),
    }),
    computed: {
        ...mapState( useFileStore, [
            "importAsMask",
            "fileName",
            "hasImage",
            "hasMask"
        ]),
        ...mapState( useSettingsStore, [
            "settings",
        ]),
    },
    watch: {
        settings: {
            deep: true,
            handler( data: SortSettings ): void {
                if ( data.width !== lastWidth || data.height !== lastHeight ) {
                    this.debouncedResize();
                } else {
                    this.runFilter();
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
            if ( file ) {
                this.loadFile( file );
            } else {
                this.showNotification( this.$t( "errors.unsupportedFile" ));
            }
        }, false );
        
        this.handleResize();

        this.debouncedResize = debounce( this.resizeSource.bind( this ), EXECUTION_BUDGET );
    },
    methods: {
        ...mapActions( useFileStore, [
            "setFileName",
            "setHasImage",
            "setHasMask",
            "setImportAsMask",
            "onMaskLoaded",
        ]),
        ...mapActions( useHistoryStore, [
            "clearHistory",
            "storeHistoryState", 
        ]),
        ...mapActions( useSettingsStore, [
            "updateSettingDimensions",
        ]),
        ...mapActions( useSystemStore, [
            "showNotification",
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

            if ( this.importAsMask ) {
                loadedMask = imageToCanvas( source );
                this.onMaskLoaded();
            } else {
                loadedImage = imageToCanvas( source );
            }
            this.showNotification( this.$t( "notifications.openedFile", { file: file.name }));
            this.setFileName( file.name.split( "." )[ 0 ]);
            this.setHasImage( !!loadedImage );
            this.saveState();
            this.resizeSource();
        },
        resizeSource(): void {
            if ( !loadedImage ) {
                return;
            }
            const { width, height } = this.settings;

            lastWidth  = width;
            lastHeight = height;
            
            // resize image (maintaining its aspect ratio) to desired width and height
            const size = constrainAspectRatio( width, height, loadedImage.width, loadedImage.height );
            resizedImage = cacheCanvas( resizeCanvas( loadedImage.canvas, size.width, size.height ));

            if ( loadedMask ) {
                // resize mask (when of equal size to image)
                if ( loadedMask.width === loadedImage.width && loadedMask.height === loadedImage.height ) {
                    resizedMask = cacheCanvas( resizeCanvas( loadedMask.canvas, size.width, size.height ));
                } else {
                    // create pattern from mask (when of different size)
                    resizedMask = createCanvasFromPattern( loadedMask, size.width, size.height );
                }
            }
            this.runFilter();
        },
        async runFilter( hiRes = false ): Promise<void> {
            try {
                sortedImage = await applyFilters( hiRes ? loadedImage : resizedImage, this.settings, hiRes ? loadedMask : resizedMask );
            } catch {
                return; // job was rejected (as a newer request has come in)
            }
            
            if ( sortedImage ) {
                if ( canvas?.parentNode ) {
                    this.$refs.canvasContainer.removeChild( canvas ); // remove previous image
                }
                ({ canvas } = sortedImage );
                if ( !hiRes ) {
                    this.$refs.canvasContainer.appendChild( canvas ); // @todo use zCanvas and Sprite pooling instead ?
                }
            }
        },
        handleResize(): void {
            this.updateSettingDimensions( MAX_IMAGE_SIZE, MAX_IMAGE_SIZE );
        },
        saveImage(): void {
            // this.runFilter( true ); // only if we want to apply onto the (large) original image
            loadedImage = sortedImage;
            this.saveState();
            this.resizeSource();
            this.runFilter();
        },
        downloadImage(): void {
            const fileName   = `${this.fileName}_${settingToString(this.settings)}_.png`;
            const destWidth  = Math.max( canvas!.width,  loadedImage.width );
            const destHeight = Math.max( canvas!.height, loadedImage.height );
            canvasToFile(
                canvas!, fileName,
                destWidth, destHeight,
                // below alternative makes destination size as close as possible to the original, but
                // as a multiple of the display size (for easier interpolation of crispness)
                // destWidth - ( destWidth % canvas!.width ), destHeight - ( destHeight % canvas!.height )
            );
            this.showNotification( this.$t( "notifications.savedFile", { file: fileName }));
        },
        importMask(): void {
            this.setImportAsMask( true );
            this.openFileSelector();
        },
        clearMask(): void {
            loadedMask = resizedMask = undefined;
            this.setHasMask( false );
            this.clearHistory();
            this.runFilter();
        },
        saveState(): void {
            this.storeHistoryState( this.settings );
        },
    },
};
</script>

<style lang="scss">
// set global styles (typography, page layout, etc.)
// beyond this point all styling should be scoped
@import "@/styles/_global";
@import "@/styles/_mixins";
@import "floating-vue/dist/style.css";

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: $color-2;
    height: 100%;
}

.app__canvas canvas {
    filter: drop-shadow(0 8px 8px rgba(0,0,0,.5));
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>

<style lang="scss">
@import "@/styles/_mixins";

$sideBarWidth: 370px;
$bgTileSize: 40px;

.app {
    &__title {
        margin: 0;
    }

    &__description {
        font-size: 0.75em;
    }

    &__canvas-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        background-image:
            linear-gradient( to bottom, transparent 98%, #000 100% ),
            linear-gradient( to right, #444 98%, #000 100% );
        background-size: $bgTileSize $bgTileSize;
        overflow: hidden;

        @include large() {
            width: calc( 100% - $sideBarWidth );
            padding: $spacing-xlarge;
            box-sizing: border-box;
        }
    }

    &__canvas {
        display: flex;
        justify-content: space-around;
        flex-direction: column;
        width: 100%;
        height: 100%;

        @include mobile() {
            align-items: center;

            &--expanded {
                justify-content: start;
            }
        }
    }

    &__sidebar {
        position: fixed;
        display: flex;
        flex-direction: column;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: $spacing-medium $spacing-large;
        background-color: $color-sidebar;
        user-select: none;
        @include animate(top, 0.25s);

        &__body {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        &__collapse-btn {
            border-radius: 50%;
            border: 2px solid $color-3;
            color: $color-1;
            background-color: transparent;
            padding: $spacing-small ($spacing-medium - $spacing-xsmall);
            position: absolute;
            top: $spacing-medium;
            right: $spacing-medium;
        }

        &__file-manager button {
            margin-right: $spacing-small;
        }
    }

    &__settings {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex: 1;
        margin-top: $spacing-small;
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
        background-color: #444;

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
        &__sidebar {
            width: $sideBarWidth;
            border-left: 6px solid $color-3;
        
            &__collapse-btn {
                display: none;
            }

            &__body {
                overflow-y: auto;
            }
        }
    }

    @include mobile() {
        &__sidebar {
            border-top: 4px solid $color-3;
            top: 50%;
            height: 50%;
            
            &__body {
                overflow-y: auto;
            }

            &--collapsed {
                top: calc(100% - 72px);

                .app__sidebar__body {
                    display: none;
                }
            }
        }

        &__title {
            margin-bottom: $spacing-small;
        }

        &__description {
            display: none;
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