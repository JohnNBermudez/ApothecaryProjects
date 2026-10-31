import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/* This is the configuration file for Vite
   which is used to configure the build process
   and settings for the project */
export default defineConfig({
    plugins: [react()],
    resolve: {
    alias: {
        "@": path.resolve(__dirname, "src")
        }
    }
});