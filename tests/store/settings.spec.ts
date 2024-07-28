import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "@/store/settings";
import { createSetting } from "../__helpers";

describe( "Settings State store", () => {
    beforeEach(() => {
        setActivePinia( createPinia());
    });
    
    it( "should be able to update the setting dimensions", () => {
        const store = useSettingsStore();

        store.updateSettingDimensions( 200, 300 );

        expect( store.settings.width ).toEqual( 200 );
        expect( store.settings.height ).toEqual( 300 );
    });

    it( "should be able to update the entire settings object", () => {
        const store = useSettingsStore();

        const setting = createSetting();

        store.updateSettings( setting );

        expect( store.settings ).toEqual( setting );
    });
});
