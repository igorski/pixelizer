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
import { defineStore } from "pinia";
import type { SortSettings } from "@/definitions/types";

export const MAX_STATES = 99;

type HistoryState = {
    step: number;
    steps: SortSettings[];
};

export const useHistoryStore = defineStore( "history", {
    state: (): HistoryState => ({
        step: -1,
        steps: [],
    }),
    getters: {
        canUndo: ( state: HistoryState ): boolean => state.step > 0 && state.steps.length > 0,
        canRedo: ( state: HistoryState ): boolean => state.step < ( state.steps.length - 1 ),
    },
    actions: {
        storeHistoryState( settings: SortSettings ): void {
            this.steps.splice( this.step + 1 );
            this.steps.push({ ...settings });

            if ( this.steps.length > MAX_STATES ) {
                this.steps.shift();
            }
            this.step = Math.min( MAX_STATES - 1, this.step + 1 );
        },
        undo(): HistoryState | undefined {
            if ( !this.canUndo ) {
                return;
            }
            this.step = Math.max( 0, this.step - 1 );
            return { ...this.steps[ this.step ]};
        },
        redo(): HistoryState | undefined {
            if ( !this.canRedo ) {
                return;
            }
            this.step = Math.min( MAX_STATES - 1, this.step + 1 );
            return { ...this.steps[ this.step ]};
        },
        clearHistory(): void {
            this.steps.length = 0;
            this.step = -1;
        },
    },
})