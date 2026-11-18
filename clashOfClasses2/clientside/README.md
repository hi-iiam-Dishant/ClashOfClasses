# Clash of Classes frontend

React 19 + Vite frontend for the Clash of Classes academic workspace.

## Development

```sh
npm ci
npm run dev
```

## Production

The root `docker-compose.yml` builds this app into an Nginx image. Nginx serves the SPA and proxies `/api/*` and `/health` to the Fastify API.

The current Class Board is an interactive prototype using local sample data. Drag-and-drop, filters, theme switching, class creation and the detail drawer work in the browser; they do not yet persist to MariaDB. See the root README for the API integration boundary and deployment instructions.
