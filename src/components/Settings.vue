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
    <section class="settings">
        <div class="settings__header">
            <h2>Settings</h2>
            <SettingsHistory />
        </div>
        <form class="settings__form" @submit.stop.prevent>
            <!-- <div class="input-wrapper">
                <label for="inputWidth">Width</label>
                <input
                    id="inputWidth"
                    v-model="internalValue.width"
                />
                <label for="inputHeight">Height</label>
                <input
                    id="inputHeight"
                    v-model="internalValue.height"
                />
            </div> -->
            
            <div class="input-wrapper">
                <label
                    for="inputAngle"
                    v-t="'settings.angle'"
                    v-tooltip.left="$t('settings.description.angle')"
                ></label>
                <input
                    type="range"
                    min="0"
                    max="359"
                    step="1"
                    v-model.number="internalValue.angle"
                    @change="saveState()"
                />
            </div>
            <div class="input-wrapper input-wrapper--no-label">
                <input
                    id="inputAngle"
                    type="number"
                    v-model.number="internalValue.angle"
                    @change="saveState()"
                />
                <button
                    :title="$t('settings.description.quarterTurn')"
                    class="rotate-button"
                    v-tooltip="$t('settings.description.quarterTurn')"
                    @click="quarterTurn()"
                >&#10561;</button>
            </div>
            <div class="input-wrapper">
                <label
                    for="inputRandom"
                    v-t="'settings.randomness'"
                    v-tooltip.left="$t('settings.description.randomness')"
                ></label>
                <input
                    id="inputRandom"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="internalValue.randomness"
                    @change="saveState()"
                />
            </div>
            <div class="input-wrapper input-wrapper--select">
                <label
                    for="inputSortingType"
                    v-t="'settings.sortingType'"
                    v-tooltip.left="$t('settings.description.sortingType')"
                ></label>
                <select
                    id="inputSortingType"
                    v-model="internalValue.sortingType"
                    @change="saveState()"
                >
                    <option
                        v-for="option in sortingOptions"
                        :key="option.value"
                        :value="option.value"
                    >{{ option.title }}</option>
                </select>
            </div>
            <div class="input-wrapper input-wrapper--select">
                <label
                    for="inputIntervalFunction"
                    v-t="'settings.intervalFunction'"
                    v-tooltip.left="$t('settings.description.intervalFunction')"
                ></label>
                <select
                    id="inputIntervalFunction"
                    v-model="internalValue.intervalFunction"
                    @change="saveState()"
                >
                    <option
                        v-for="option in intervalOptions"
                        :key="option.value"
                        :value="option.value"
                    >{{ option.title }}</option>
                </select>
            </div>
            <div class="input-wrapper">
                <label
                    for="inputLowerThreshold"
                    v-t="'settings.lowerThreshold'"
                    v-tooltip.left="$t('settings.description.lowerThreshold')"
                ></label>
                <input
                    id="inputLowerThreshold"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="internalValue.lowerThreshold"
                    :disabled="!supportsThreshold"
                    @change="saveState()"
                />
            </div>
            <div class="input-wrapper">
                <label
                    for="inputUpperThreshold"
                    v-t="'settings.upperThreshold'"
                    v-tooltip.left="$t('settings.description.upperThreshold')"
                ></label>
                <input
                    id="inputUpperThreshold"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="internalValue.upperThreshold"
                    :disabled="!supportsThreshold"
                    @change="saveState()"
                />
            </div>
            <div class="input-wrapper">
                <label
                    for="inputCharLength"
                    v-t="'settings.charLength'"
                    v-tooltip.left="$t('settings.description.charLength')"
                ></label>
                <input
                    id="inputCharLength"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="internalValue.charLength"
                    :disabled="!supportsCharLength"
                    @change="saveState()"
                />
            </div>
            <div class="input-wrapper mask-import">
                <label
                    v-t="'settings.mask'"
                    v-tooltip.left="$t('settings.description.useMask')"
                ></label>
                <div class="button-group">
                    <button
                        v-t="'settings.description.import'"
                        class="settings-button"
                        @click="importMask()"
                    ></button>
                    <button
                        v-t="'settings.description.clear'"
                        class="settings-button settings-button--secondary"
                        :disabled="!hasMask"
                        @click="clearMask()"
                    ></button>
                </div>
            </div>
        </form>
    </section>
    <section class="footer">
        <button
            @click="randomize()"
            class="settings-button"
            v-t="'settings.randomize'"
            v-tooltip="$t('settings.description.randomize')"
        ></button>
        <button
            @click="saveImage()"
            class="save-button"
            :disabled="!hasImage"
            v-t="'settings.useAsBase'"
            v-tooltip="$t('settings.description.useAsBase')"
        ></button>
    </section>
 </template>

<script lang="ts">
import { mapState, mapActions } from "pinia";
import type { SortSettings } from "@/definitions/types";
import { SortingType } from "@/filters/sorter/sorting";
import { IntervalFunction } from "@/filters/sorter/interval";
import { useFileStore } from "@/store/file";
import { useHistoryStore } from "@/store/history";
import { useSettingsStore } from "@/store/settings";
import { randomFromList } from "@/utils/random";
import SettingsHistory from "./SettingsHistory.vue";

const SORTING_TYPES = [ SortingType.HUE, SortingType.INTENSITY, SortingType.LIGHTNESS, SortingType.MINIMUM, SortingType.SATURATION ];
const INTERVAL_FNS  = [ IntervalFunction.NONE, IntervalFunction.EDGES, IntervalFunction.RANDOM, IntervalFunction.THRESHOLD, IntervalFunction.WAVES ];

const CHAR_LENGTH_SUPPORTING_INTERVALS = [
    IntervalFunction.RANDOM, IntervalFunction.WAVES
];

const THRESHOLD_SUPPORTING_INTERVALS = [
    IntervalFunction.EDGES, IntervalFunction.THRESHOLD, 
];

const QUARTER_ROTATION_ANGLES = [ 0, 90, 180, 270 ];

type SelectOption = {
    value: string | number;
    title: string;
};

export default {
    emits: [ "save-image", "save-state", "import-mask", "clear-mask" ],
    components: {
        SettingsHistory,
    },
    computed: {
        ...mapState( useFileStore, [
            "hasImage",
            "hasMask",
        ]),
        ...mapState( useSettingsStore, [
            "settings", 
        ]),
        internalValue: {
            get(): SortSettings {
                return this.settings;
            },
            set( value: SortSettings ): void {
                this.updateSettings( value );
            },
        },
        supportsCharLength(): boolean {
            return CHAR_LENGTH_SUPPORTING_INTERVALS.includes( this.settings.intervalFunction );
        },
        supportsThreshold(): boolean {
            return THRESHOLD_SUPPORTING_INTERVALS.includes( this.settings.intervalFunction );
        },
        sortingOptions(): SelectOption[] {
            return SORTING_TYPES.map( value => ({
                value,
                title: this.$t( `sortingTypes.${value}` )
            }));
        },
        intervalOptions(): SelectOption[] {
            return INTERVAL_FNS.map( value => ({
                value,
                title: this.$t( `intervalFunctions.${value}` )
            }));
        },
    },
    watch: {
        'internalValue.angle'( angle: number ): void {
            if ( angle < -360 || angle > 360 ) {
                this.internalValue.angle = angle % 360;
            }
        },
    },
    methods: {
        ...mapActions( useHistoryStore, [
            "clearHistory",
        ]),
        quarterTurn(): void {
            let { angle } = this.internalValue;

            angle = ( angle + 90 ) % 360;
            // find nearest 90 angle increment
            angle = QUARTER_ROTATION_ANGLES.reduce(( prev, curr ) => Math.abs( curr - angle ) < Math.abs( prev - angle ) ? curr : prev );

            this.internalValue.angle = angle;

            this.saveState();
        },
        randomize(): void {
            this.internalValue.angle = randomFromList( QUARTER_ROTATION_ANGLES );
            this.internalValue.randomness = Math.random();
            this.internalValue.charLength = Math.random();
            this.internalValue.lowerThreshold = Math.random();
            this.internalValue.upperThreshold = Math.random();
            this.internalValue.sortingType = randomFromList( SORTING_TYPES );
            this.internalValue.intervalFunction = randomFromList( INTERVAL_FNS );

            this.saveState();
        },
        saveImage(): void {
            this.$emit( "save-image" );
            this.clearHistory();
        },
        saveState(): void {
            this.$emit( "save-state" );
        },
        importMask(): void {
            this.$emit( "import-mask" );
        },
        clearMask(): void {
            this.$emit( "clear-mask" );
        },
    },
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";

$labelWidth: 135px;

.settings {
    margin-bottom: $spacing-small;
    
    &__header {
        position: relative;
    }
}

.input-wrapper {
    display: flex;
    justify-content: space-between;
    padding: $spacing-small 0;
    position: relative;

    &--no-label {
        justify-content: initial;
        gap: $spacing-xsmall;
        
        input {
            margin-left: $labelWidth;
        }
    }

    label {
        width: $labelWidth;
        cursor: pointer;
    }

    input,
    select {
        flex: 1;
    }

    &--select {
        &::before,
        &::after {
            --size: 0.3rem;
            content: "";
            position: absolute;
            right: 1rem;
            pointer-events: none;
        }

        &::after {
            border-left: var(--size) solid transparent;
            border-right: var(--size) solid transparent;
            border-top: var(--size) solid black;
            top: 55%;
        }

        &::before {
            border-left: var(--size) solid transparent;
            border-right: var(--size) solid transparent;
            border-bottom: var(--size) solid black;
            top: 40%;
        }

        select {
            appearance: none;
            padding: $spacing-small $spacing-medium;
            background-color: #fff;
            border: 1px solid #caced1;
            border-radius: $spacing-small;
            color: #000;
            cursor: pointer;
        }
    }
}

.button-group {
    display: flex;
    gap: $spacing-small;
    flex: 1;
}

#inputAngle {
    flex: 0;
    width: $spacing-large + $spacing-medium;
    border-radius: $spacing-small;
    padding: $spacing-small $spacing-medium;
    border: none;
}

.settings-button {
    @include button();

    &--secondary {
        @include button( false );
    }
}


.rotate-button {
    @include smallButton( 1.5em, 0 $spacing-small );
}

.save-button {
    @include button( false );
    margin-left: $spacing-small;
}
</style>