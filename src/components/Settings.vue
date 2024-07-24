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
        <div class="input-wrapper">
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
        </div>
        <div class="input-wrapper">
            <label for="inputAngle">Angle</label>
            <input
                id="inputAngle"
                v-model.number="internalValue.angle"
            />
            <input
                id="inputAngle"
                type="range"
                min="0"
                max="360"
                step="1"
                v-model.number="internalValue.angle"
            />
        </div>
        <div class="input-wrapper">
            <label for="inputRandom">Randomness</label>
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
            <label for="inputLowerThreshold">Lower threshold</label>
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
            <label for="inputUpperThreshold">Upper threshold</label>
            <input
                id="inputUpperThreshold"
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="internalValue.upperThreshold"
            />
        </div>
        <div class="input-wrapper">
            <label for="inputSortingType">Sorting type</label>
            <select
                id="inputSortingType"
                v-model="internalValue.sortingType"
            >
                <option value="hue">Hue</option>
                <option value="intensity">Intensity</option>
                <option value="lightness">Lightness</option>
                <option value="minimum">Minimum</option>
                <option value="saturation">Saturation</option>
            </select>
        </div>
        <div class="input-wrapper">
            <label for="inputIntervalFunction">Interval function</label>
            <select
                id="inputIntervalFunction"
                v-model="internalValue.intervalFunction"
            >
                <option value="none">None</option>
            <!-- <option value="edges">Edges</option> -->
                <option value="random">Random</option>
                <option value="threshold">Threshold</option>
                <option value="waves">Waves</option>
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
        <button @click="randomize()">Randomize!</button>
    </section>
 </template>

<script lang="ts">
import { PropType } from "vue";
import type { SortSettings } from "@/definitions/types";
import { SortingType } from "@/filters/sorter/sorting";
import { IntervalFunction } from "@/filters/sorter/interval";
import { randomFromList } from "@/utils/random";

// @topo compute options!
const SORTING_TYPES = [ SortingType.HUE, SortingType.INTENSIY, SortingType.LIGHTNESS, SortingType.MINIMUM, SortingType.SATURATION ];
const INTERVAL_FNS  = [ IntervalFunction.NONE, /*IntervalFunction.EDGES, */IntervalFunction.RANDOM, IntervalFunction.THRESHOLD, IntervalFunction.WAVES ];

const CHAR_LENGTH_SUPPORTING_INTERVALS = [
    IntervalFunction.RANDOM, IntervalFunction.WAVES
];

export default {
    props: {
        modelValue: {
            type: Object as PropType<SortSettings>,
            required: true,
        },
    },
    emits: [ "update:modelValue" ],
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
    },
}
</script>
