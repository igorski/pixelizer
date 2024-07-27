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
        </div>
        
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
import { PropType } from "vue";
import type { SortSettings } from "@/definitions/types";
import { SortingType } from "@/filters/sorter/sorting";
import { IntervalFunction } from "@/filters/sorter/interval";
import { useHistoryStore } from "@/store/history";
import { randomFromList } from "@/utils/random";

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
    props: {
        modelValue: {
            type: Object as PropType<SortSettings>,
            required: true,
        },
        hasImage: {
            type: Boolean,
            default: false,
        },
    },
    emits: [ "update:modelValue", "restore", "save-image", "save-state" ],
    computed: {
        ...mapState( useHistoryStore, [
            "canUndo",
            "canRedo",
        ]),
        internalValue: {
            get(): SortSettings {
                return this.modelValue;
            },
            set( value: SortSettings ): void {
                this.$emit( "update:modelValue", value );
            },
        },
        supportsCharLength(): boolean {
            return CHAR_LENGTH_SUPPORTING_INTERVALS.includes( this.modelValue.intervalFunction );
        },
        supportsThreshold(): boolean {
            return THRESHOLD_SUPPORTING_INTERVALS.includes( this.modelValue.intervalFunction );
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
        handleUndo(): void {
            if ( this.canUndo ) {
                this.$emit( "restore", this.undo());
            }
        },
        handleRedo(): void {
            if ( this.canRedo ) {
                this.$emit( "restore", this.redo());
            }
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

    &__history {
        position: absolute;
        top: 0;
        right: 0;

        &__button {
            @include smallButton();
        }
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

#inputAngle {
    flex: 0;
    width: $spacing-large;
    border-radius: $spacing-small;
    padding: $spacing-small $spacing-medium;
    border: none;
}

.settings-button {
    @include button();
}


.rotate-button {
    @include smallButton( 1.5em, 0 $spacing-small );
}

.save-button {
    @include button( false );
    margin-left: $spacing-small;
}
</style>