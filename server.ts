import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, resolve, extname } from "path";
import { lookup } from "mime-types";
import { WebSocketServer, WebSocket } from "ws";
import { watch } from "fs";

// Define the root directory
const ROOT_DIR = __dirname;
const SRC_DIR = join(ROOT_DIR, "src");

// HMR Server
const wss = new WebSocketServer({ port: 8081 });

// Set of clients
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
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

// Watch files for changes (recursive watch on the root directory)
watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && isSupportedFile(filename)) {
    broadcast("reload");
  }
});

function isSupportedFile(filename: string) {
  return (
    filename.endsWith(".html") ||
    filename.endsWith(".css") ||
    filename.endsWith(".js")
  );
}

// Inject HMR script into HTML
function injectHMRScript(htmlContent: string) {
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
}

// Function to attempt to read a file from the root or src directory
async function readFileFromDirs(urlPath: string): Promise<string> {
  const rootFilePath = resolve(join(ROOT_DIR, urlPath));
  const srcFilePath = resolve(join(SRC_DIR, urlPath));

  try {
    return await readFile(rootFilePath, "utf8");
  } catch {
    return await readFile(srcFilePath, "utf8");
  }
}

// HTTP server
const server = createServer(async (req, res) => {
  try {
    // Ignore requests for favicon.ico
    if (req.url === "/favicon.ico") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    // Determine the requested file based on the URL
    const urlPath = req.url === "/" ? "index.html" : req.url;

    console.log(`Attempting to serve: ${urlPath}`);

    // Attempt to read from the root or src directory
    let data: string | undefined = undefined;
    let ext = extname(urlPath ?? "");
    try {
      data = await readFileFromDirs(urlPath ?? "");
    } catch (err) {
      console.error("Error reading file:", err);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File Not Found");
      return;
    }

    // Determine content type
    const contentType = lookup(ext) || "application/octet-stream";

    // Inject HMR client script into HTML files
    if (ext === ".html") {
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
});

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
