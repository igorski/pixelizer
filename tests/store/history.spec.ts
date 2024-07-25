import type { Store } from "pinia";
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import type { SortSettings } from "@/definitions/types";
import { useHistoryStore, MAX_STATES } from "@/store/history";

function createSetting( data: Partial<SortSettings> = {}): SortSettings {
    return {
        width: 300,
        height: 300,
        angle: 0,
        randomness: 0,
        charLength: 10,
        lowerThreshold: 0.25,
        upperThreshold: 0.75,
        sortingFunction: "lightness",
        intervalFunction: "waves",
        ...data,
    };
}

describe( "History State store", () => {
    beforeEach(() => {
        setActivePinia( createPinia());
    });
    
    it( "should by default have no history states and a negative step", () => {
        const store = useHistoryStore();

        expect( store.steps.length ).toEqual( 0 );
        expect( store.step ).toEqual( -1 );
    });

    describe( "getters", () => {
        describe( "canUndo", () => {
            it( "should by default not be able to undo as there are no saved states yet", () => {
                const store = useHistoryStore();

                expect( store.canUndo ).toBe( false );
            });

            it( "should not be able to undo when there is a saved state but the current step is below that state position", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );

                expect( store.canUndo ).toBe( false );
            });

            it( "should be able to undo when there is a saved state and the current step is above that state position", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );
                store.storeHistoryState( createSetting() );

                expect( store.canUndo ).toBe( true );
            });
        });

        describe( "canRedo", () => {
            it( "should by default not be able to redo as there are no saved states yet", () => {
                const store = useHistoryStore();

                expect( store.canRedo ).toBe( false );
            });

            it( "should not be able to redo when there is a saved state but the current step is above that state position", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );
                store.storeHistoryState( createSetting() );

                expect( store.canRedo ).toBe( false );
            });

            it( "should be able to redo when there is a saved state and the current step is below that state position", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );
                store.storeHistoryState( createSetting() );

                store.step = store.step - 1;

                expect( store.canRedo ).toBe( true );
            });
        });
    });

    describe( "actions", () => {
        describe( "when storing a new history state", () => {
            it( "should be able to append the state to the list", () => {
                const store = useHistoryStore();
                const setting = createSetting();

                store.storeHistoryState( setting );

                expect( store.steps ).toHaveLength( 1 );
                expect( store.steps[ 0 ]).toEqual( setting );
            });

            it( "should update the step to reflect the position of the added state, minus 1", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );

                expect( store.step ).toEqual( 0 );
            });

            it( "should be able to append the state after the current step, clearing all states after", () => {
                const store = useHistoryStore();

                for ( let i = 0; i < 3; ++i ) {
                    store.steps.push( createSetting() );
                }
                store.step = 1; // not at the end, but middle

                const setting = createSetting();

                store.storeHistoryState( setting );

                expect( store.steps ).toHaveLength( 3 );
                expect( store.step ).toEqual( 2 );
                expect( store.steps[ 2 ]).toEqual( setting );
            });

            it( "should be able to clear the earlier states when exceeding the maximum available steps", () => {
                const store = useHistoryStore();

                const states: SortSettings[] = [];
                
                for ( let i = 0; i < MAX_STATES; ++i ) {
                    states.push( createSetting());
                }

                store.steps = [ ...states ];
                store.step = states.length - 1;

                const setting = createSetting();

                store.storeHistoryState( setting );

                expect( store.steps ).toHaveLength( MAX_STATES );
                expect( store.step ).toEqual( MAX_STATES - 1 );
                expect( store.steps[ store.step ]).toEqual( setting );
                expect( store.steps[ 0 ]).toEqual( states[ 1 ]);
            });
        });

        describe( "when undo-ing a state", () => {
            it( "should not do anything when there is nothing to undo", () => {
                const store = useHistoryStore();

                store.undo();

                expect( store.step ).toEqual( -1 );
            });

            it( "should go back to the last step when undo-ing", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );
                store.storeHistoryState( createSetting() );

                store.undo();

                expect( store.step ).toEqual( 0 );
            });

            it( "should return the previous state object", () => {
                const store = useHistoryStore();

                const setting1 = createSetting();
                const setting2 = createSetting();

                store.storeHistoryState( setting1 );
                store.storeHistoryState( setting2 );

                expect( store.undo()).toEqual( setting1 );
            });
        });

        describe( "when redo-ing a state", () => {
            it( "should not do anything when there is nothing to redo", () => {
                const store = useHistoryStore();

                store.redo();

                expect( store.step ).toEqual( -1 );
            });

            it( "should go back to the next step when redo-ing", () => {
                const store = useHistoryStore();

                store.storeHistoryState( createSetting() );
                store.storeHistoryState( createSetting() );

                store.step = 0;

                store.redo();

                expect( store.step ).toEqual( 1 );
            });

            it( "should return the next state object", () => {
                const store = useHistoryStore();

                const setting1 = createSetting();
                const setting2 = createSetting();

                store.storeHistoryState( setting1 );
                store.storeHistoryState( setting2 );

                store.step = 0;

                expect( store.redo()).toEqual( setting2 );
            });
        });

        describe( "when clearing the history", () => {
            it( "should be able to clear the states and reset the step", () => {
                const store = useHistoryStore();

                for ( let i = 0; i < MAX_STATES; ++i ) {
                    store.storeHistoryState( createSetting() );
                }

                store.clearHistory();

                expect( store.steps ).toHaveLength( 0 );
                expect( store.step ).toEqual( -1 );
            });
        });
    });
});
