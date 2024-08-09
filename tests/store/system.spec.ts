import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import { useSystemStore } from "@/store/system";

describe( "System State store", () => {
    beforeEach(() => {
        setActivePinia( createPinia());
    });

    describe( "when managing the loading state", () => {
        it( "should by default not be loading", () => {
            const store = useSystemStore();

            expect( store.isLoading ).toBe( false );
            expect( store.loadingProgress ).toBe( 0 );
        });
        
        it( "should be able to toggle the loading state", () => {
            const store = useSystemStore();

            store.setLoading( true );

            expect( store.isLoading ).toBe( true );
        });

        it( "should be able to set the loading progress", () => {
            const store = useSystemStore();

            store.setLoading( true );
            store.setLoadingProgress( 66 );

            expect( store.loadingProgress ).toBe( 66 );

            expect( store.isLoading ).toBe( true );
        });

        it( "should unset the loading state when the loading progress is set to 100", () => {
            const store = useSystemStore();

            store.setLoading( true );
            store.setLoadingProgress( 100 );

            expect( store.isLoading ).toBe( false );
        });
    });

    describe( "when showing notification messages", () => {
        it( "should be able to show a notification displaying its title and message", () => {
            const store = useSystemStore();

            store.showNotification( "foo" );
            
            expect( store.notifications ).toEqual([ "foo" ]);
        });

        it( "should be able to queue multiple notifications", () => {
            const store = useSystemStore();

            store.showNotification( "foo" );
            store.showNotification( "bar" );
            
            expect( store.notifications ).toEqual([ "foo", "bar" ]);
        });

        it( "should be able to clear all queued notifications", () => {
            const store = useSystemStore();

            store.showNotification( "foo" );
            store.showNotification( "bar" );

            store.clearNotifications();

            expect( store.notifications ).toEqual( [] );
        });
    });
});
