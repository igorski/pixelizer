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
    <div class="settings__history">
        <button
            :title="$t('settings.undo')"
            :disabled="!canUndo"
            class="settings__history__button"
            v-tooltip="$t('settings.description.undo')"
            @click="handleUndo()"
        >&#8678;</button>
        <button
            :title="$t('settings.redo')"
            :disabled="!canRedo"
            class="settings__history__button"
            v-tooltip="$t('settings.description.redo')"
            @click="handleRedo()"
        >&#8680;</button>
    </div>
</template>

<script lang="ts">
import { mapState, mapActions } from "pinia";
import { useHistoryStore } from "@/store/history";
import { useSettingsStore } from "@/store/settings";

export default {
    computed: {
        ...mapState( useHistoryStore, [
            "canUndo",
            "canRedo",
        ]),
    },
    mounted(): void {
        // no need to clean up as this component is active for the applications total lifecycle
        document.addEventListener( "keydown", event => {
            if ( event.key !== "z" ) {
                return;
            }
            if (( event.ctrlKey || event.metaKey )) {
                if ( event.shiftKey ) {
                    this.handleRedo();
                } else {
                    this.handleUndo();
                }
            }
            event.preventDefault();
        });
    },
    methods: {
        ...mapActions( useHistoryStore, [
            "undo",
            "redo",
        ]),
        ...mapActions( useSettingsStore, [
            "updateSettings",
        ]),
        handleUndo(): void {
            if ( this.canUndo ) {
                this.updateSettings( this.undo());
            }
        },
        handleRedo(): void {
            if ( this.canRedo ) {
                this.updateSettings( this.redo());
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";

.settings__history {
    position: absolute;
    top: 0;
    right: 0;

    &__button {
        @include smallButton();
    }
}
</style>