import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    // Bootstrap 5.3’s Sass still uses older patterns that newer Sass versions warn about, but they are not fatal. 
    // Silencing those specific deprecation categories removes the noise while keeping the build working.
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    "import",
                    "global-builtin",
                    "color-functions",
                    "if-function"
                ]
            }
        }
    },
    server: {
        port: 3002,
        strictPort: true, 
    },
});
