import { describe, it, expect } from "vitest";
import { settingToString, stringToSetting } from "@/utils/string";
import { createSetting } from "../__helpers";

describe( "String util", () => {
    it( "should be able to convert a setting to a string", () => {
        expect( settingToString( createSetting() )).toBeTypeOf( "string" );
    });

    it( "should be able to convert a setting to a string and back again", () => {
        const setting = createSetting();

        const stringifiedSetting = settingToString( setting );

        expect( stringToSetting( stringifiedSetting )).toEqual( setting );
    });
});