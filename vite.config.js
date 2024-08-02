import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import vue from "@vitejs/plugin-vue";

const dirSrc    = `./src`;
const dirAssets = `./assets`;
const dest      = `${__dirname}/dist`;

export default defineConfig({
    base: "./",
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [{
                src: dirAssets,
                dest: path.resolve( dest ),
            }]
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve( __dirname, "./src" ),
        },
    },
});