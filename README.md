# Simple Node.js Server with HMR

This project is a simple Node.js web server built with support for Hot Module Replacement (HMR) for HTML, CSS, and JavaScript files. The server automatically reloads the browser when changes are detected in any of these files, providing a seamless development experience.

## Features

- **Hot Module Replacement (HMR)**: Automatically reloads the browser when changes are detected in `.html`, `.css`, or `.js` files.
- **WebSocket Integration**: Uses WebSockets to notify the client of changes, enabling real-time updates without manual refreshes.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- TypeScript (`npm install -g typescript`)
- Bun

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/tomassabol/web-server-hmr
   cd web-server-hmr
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Run the server**
   ```bash
   bun run dev
   ```

### How it works

1. **File Watching**: The server watches for changes in `.html`, `.css`, and `.js` files within the project directory.

2. **WebSocket Server**: A WebSocket server runs on port `8081` to communicate with the browser. When a file change is detected, the server broadcasts a reload message to all connected clients.

3. **Client-Side Script**: An HMR script is injected into the HTML files served by the server. This script listens for messages from the WebSocket server and triggers a full page reload when a change is detected.

### Customization

- **Port Configuration**: The server runs on port `8080` by default. You can change this by modifying the `PORT` constant in `src/index.ts`.
- **Additional File Types**: To watch and reload additional file types, modify the file extensions checked in the `watchFiles` function in `src/index.ts`.

### Deployment

Please don't
