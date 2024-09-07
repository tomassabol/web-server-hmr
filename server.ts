import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { readFile } from "fs/promises";
import { join, resolve, extname } from "path";
import { lookup } from "mime-types";
import WebSocket, { WebSocketServer } from "ws";
import { watch } from "fs";

// HMR Server
const wss = new WebSocketServer({ port: 8081 });

// Set of clients
const clients = new Set<WebSocket>();

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);

  ws.on("close", () => clients.delete(ws));
});

const broadcast = (message: string) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Watch files for changes
const watchFiles = (dir: string) => {
  watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && isSupportedFile(filename)) {
      broadcast("reload");
    }
  });
};

function isSupportedFile(filename: string) {
  return (
    filename.endsWith(".html") ||
    filename.endsWith(".css") ||
    filename.endsWith(".js")
  );
}

// Start watching the directory
watchFiles(__dirname);

// HACK: Function to inject HMR script into HTML
const injectHMRScript = (htmlContent: string): string => {
  const hmrScript = `
    <script>
      const ws = new WebSocket('ws://localhost:8081');
      ws.onmessage = (event) => {
        if (event.data === 'reload') {
          location.reload();  // Full page reload
        }
      };
    </script>`;
  return htmlContent.replace("</body>", `${hmrScript}</body>`);
};

// HTTP server
const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Ignore requests for favicon.ico
      if (req.url === "/favicon.ico") {
        res.writeHead(204); // No Content
        res.end();
        return;
      }

      // Determine the requested file based on the URL
      const filePath =
        req.url === "/"
          ? join(__dirname, "index.html")
          : join(__dirname, req.url ?? "");

      console.log("Serving file:", filePath);

      // Resolve the path to ensure correct path without duplication
      const normalizedPath = resolve(filePath);

      // Get the file extension to determine content type
      const ext = extname(filePath);
      const contentType = lookup(ext) || "application/octet-stream";

      // Read the requested file
      let data = await readFile(
        normalizedPath,
        contentType.startsWith("text/") ? "utf8" : undefined
      );

      // Inject HMR client script into HTML files
      if (ext === ".html") {
        if (Buffer.isBuffer(data)) {
          data = injectHMRScript(data.toString());
          return;
        }

        data = injectHMRScript(data);
      }

      // Set the appropriate response header
      res.writeHead(200, { "Content-Type": contentType });

      // Send the response
      res.end(data);
    } catch (err) {
      console.error("Error serving file:", err);
      // Handle errors, such as file not found
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File Not Found");
    }
  }
);

// Define the port to listen on
const PORT = 8080;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle shutdown
process.on("SIGINT", () => {
  console.log("Shutting down the server...");
  server.close(() => {
    wss.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
});
