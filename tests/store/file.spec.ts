import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import { useFileStore } from "@/store/file";

describe( "File State store", () => {
    beforeEach(() => {
        setActivePinia( createPinia());
    });
    
    it( "should by default have no loaded resources", () => {
        const store = useFileStore();

        expect( store.hasImage ).toBe( false );
        expect( store.hasMask ).toBe( false );
    });

    it( "should be able to set the file name for the dominant resource", () => {
        const store = useFileStore();

        expect( store.fileName ).toBeUndefined();

        store.setFileName( "foo.jpg" );

        expect( store.fileName ).toEqual( "foo.jpg" );
    });

    it( "should be able to set flag the image resource as loaded", () => {
        const store = useFileStore();
        
        store.setHasImage( true );
        
        expect( store.hasImage ).toBe( true );
    });

    it( "should be able to set flag the mask resource as loaded", () => {
        const store = useFileStore();
        
        store.setHasMask( true );
        
        expect( store.hasMask ).toBe( true );
    });

    it( "should be able to set the import resource as mask state", () => {
        const store = useFileStore();

        expect( store.importAsMask ).toBe( false );

        store.setImportAsMask( true );

        expect( store.importAsMask ).toBe( true );
    });

    it( "should be able to unset the import as mask flag and mark the mask resource as loaded on mask load", () => {
        const store = useFileStore();

        store.importAsMask = true;
        store.hasMask = false;

        store.onMaskLoaded();

        expect( store.importAsMask ).toBe( false );
        expect( store.hasMask ).toBe( true );
    });
});
