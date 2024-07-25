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
    <section class="controls">

        <h2>Settings</h2>
        
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
            <label for="inputAngle" v-t="'settings.angle'"></label>
            <input
                type="range"
                min="0"
                max="360"
                step="1"
                v-model.number="internalValue.angle"
            />
        </div>
        <div class="input-wrapper input-wrapper--no-label">
            <input
                id="inputAngle"
                v-model.number="internalValue.angle"
            />
        </div>
        <div class="input-wrapper">
            <label for="inputRandom" v-t="'settings.randomness'"></label>
            <input
                id="inputRandom"
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="internalValue.randomness"
            />
        </div>
        <div class="input-wrapper">
            <label for="inputLowerThreshold" v-t="'settings.lowerThreshold'"></label>
            <input
                id="inputLowerThreshold"
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="internalValue.lowerThreshold"
            />
        </div>
        <div class="input-wrapper">
            <label for="inputUpperThreshold" v-t="'settings.upperThreshold'"></label>
            <input
                id="inputUpperThreshold"
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="internalValue.upperThreshold"
            />
        </div>
        <div class="input-wrapper input-wrapper--select">
            <label for="inputSortingType" v-t="'settings.sortingType'"></label>
            <select
                id="inputSortingType"
                v-model="internalValue.sortingType"
            >
                <option
                    v-for="option in sortingOptions"
                    :key="option.value"
                    :value="option.value"
                >{{ option.title }}</option>
            </select>
        </div>
        <div class="input-wrapper input-wrapper--select">
            <label for="inputIntervalFunction" v-t="'settings.intervalFunction'"></label>
            <select
                id="inputIntervalFunction"
                v-model="internalValue.intervalFunction"
            >
                <option
                    v-for="option in intervalOptions"
                    :key="option.value"
                    :value="option.value"
                >{{ option.title }}</option>
            </select>
        </div>
        <div
            v-if="supportsCharLength"
            class="input-wrapper"
        >
            <label for="inputCharLength">Char length </label>
            <input
                id="inputCharLength"
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="internalValue.charLength"
            />
        </div>
    </section>
    <section class="footer">
        <button
            @click="randomize()"
            class="settings-button"
            v-t="'settings.randomize'"
            v-tooltip="$t('settings.randomizeExplanation')"
        ></button>
        <button
            @click="save()"
            class="save-button"
            :disabled="!hasImage"
            v-t="'settings.useAsBase'"
            v-tooltip="$t('settings.useAsBaseExplanation')"
        ></button>
    </section>
 </template>

<script lang="ts">
import { PropType } from "vue";
import type { SortSettings } from "@/definitions/types";
import { SortingType } from "@/filters/sorter/sorting";
import { IntervalFunction } from "@/filters/sorter/interval";
import { randomFromList } from "@/utils/random";

const SORTING_TYPES = [ SortingType.HUE, SortingType.INTENSITY, SortingType.LIGHTNESS, SortingType.MINIMUM, SortingType.SATURATION ];
const INTERVAL_FNS  = [ IntervalFunction.NONE, /*IntervalFunction.EDGES, */IntervalFunction.RANDOM, IntervalFunction.THRESHOLD, IntervalFunction.WAVES ];

const CHAR_LENGTH_SUPPORTING_INTERVALS = [
    IntervalFunction.RANDOM, IntervalFunction.WAVES
];

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
    emits: [ "update:modelValue", "save" ],
    computed: {
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
    methods: {
        randomize(): void {
            this.internalValue.angle = randomFromList([ 0, 90, 180, 270 ]);
            this.internalValue.randomness = Math.random();
            this.internalValue.charLength = Math.random();
            this.internalValue.lowerThreshold = Math.random();
            this.internalValue.upperThreshold = Math.random();
            this.internalValue.sortingType = randomFromList( SORTING_TYPES );
            this.internalValue.intervalFunction = randomFromList( INTERVAL_FNS );
        },
        save(): void {
            this.$emit( "save" );
        },
    },
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";

$labelWidth: 125px;

.input-wrapper {
    display: flex;
    justify-content: space-between;
    padding: $spacing-small 0;
    position: relative;

    &--no-label input {
        margin-left: $labelWidth;
    }

    label {
        width: $labelWidth;
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

.settings-button {
    @include button();
}

.save-button {
    @include button( false );
}
</style>