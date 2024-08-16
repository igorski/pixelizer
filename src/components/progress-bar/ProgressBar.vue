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
    <div
        class="progress-bar"
        :class="{ 'progress-bar--visible': isVisible }"
    >
        <div class="progress-bar__indicator">
            <span
                class="progress-bar__indicator__progress"
                :style="{width: `${loadingProgress}%`}"
            ></span>
        </div>
    </div>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { useSystemStore } from "@/store/system";

const VISIBLE_TIMEOUT   = 300;
const INVISIBLE_TIMEOUT = 1000;
let visibleTimeout;

export default {
    data: () => ({
        isVisible: false,
    }),
    computed: {
        ...mapState( useSystemStore, [
            "isLoading",
            "loadingProgress",
        ]),
    },
    watch: {
        isLoading( value: boolean ): void {
            if ( value === true ) {
                window.clearTimeout( visibleTimeout );
                visibleTimeout = window.setTimeout(() => {
                    this.isVisible = this.loadingProgress < 80;
                }, VISIBLE_TIMEOUT );
            } else {
                window.clearTimeout( visibleTimeout );
                visibleTimeout = window.setTimeout(() => {
                    this.isVisible = false;
                }, INVISIBLE_TIMEOUT );
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_colors";
@import "@/styles/_variables";
@import "@/styles/_mixins";

$shadowSize: 8px;
$progressBarHeight: 25px;
$progressBarOuter: $progressBarHeight + ( $shadowSize * 2 );

.progress-bar {
    position: absolute;
    display: flex;
    align-items: center;
    background-color: $color-sidebar;
    left: 50%;
    transform: translate(-50%);
    width: 100px;
    height: $progressBarHeight;
    border-radius: $spacing-small;
    padding: 0 $spacing-small;
    box-sizing: border-box;
    filter: drop-shadow(0 $shadowSize $shadowSize rgba(0,0,0,.5));
    @include large() {
        bottom: -$progressBarHeight;
        transition: bottom 0.3s;

        &--visible {
            bottom: $spacing-medium;
        }
    }

    @include mobile() {
        top: -$progressBarOuter;
        transition: top 0.3s;
    
        &--visible {
            top: $spacing-medium;
        }
    }

    &__indicator {
        display: block;
        width: 100%;
        height: 10px;
        border-radius: $spacing-xsmall;
        background-color: $color-1;
        overflow: hidden;

        &__progress {
            display: block;
            height: inherit;
            background-color: $color-3;
            transition: width 0.1s;
        }
    }
}
</style>