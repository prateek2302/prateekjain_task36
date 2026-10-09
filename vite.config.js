import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? "/keyspace-jwt-auth/" : "/",
  server: {
    proxy: {
      "/register": "http://localhost:4000",
      "/login": "http://localhost:4000",
      "/protected": "http://localhost:4000"
    }
  }
});
