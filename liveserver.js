const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Create Server
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    if (filePath === './') {
        // Show directory listing for root
        return sendDirectoryListing('.', req, res);
    }
    
    // Check if path is a directory
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        return sendDirectoryListing(filePath, req, res);
    }
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('فایل پیدا نشد - File not found');
            } else {
                res.writeHead(500);
                res.end('خطای سرور - Server error');
            }
            return;
        }
        
        // If it's an HTML file, inject our live reload script
        if (path.extname(filePath) === '.html') {
            content = content.toString().replace('</body>', `
                <script>
                    const evtSource = new EventSource('/live-reload');
                    evtSource.onmessage = function(event) {
                        if (event.data === 'reload') {
                            window.location.reload();
                        }
                    }
                </script>
                </body>
            `);
        }
        
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
    });
});

// Function to send directory listing
function sendDirectoryListing(dirPath, req, res) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
        if (err) {
            res.writeHead(500);
            res.end('خطا در خواندن دایرکتوری - Error reading directory');
            return;
        }

        // Create HTML content
        let html = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فهرست فایل‌ها - Directory Listing</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    .item { display: flex; padding: 10px; border-bottom: 1px solid #eee; align-items: center; }
                    .item:hover { background: #f8f8f8; }
                    .item a { color: #2196F3; text-decoration: none; flex-grow: 1; }
                    .item a:hover { text-decoration: underline; }
                    .icon { margin-left: 10px; width: 20px; }
                    .path { color: #666; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>فهرست فایل‌ها</h1>
                    <div class="path">مسیر فعلی: ${dirPath === '.' ? '/' : dirPath}</div>
        `;

        // Add parent directory link if not in root
        if (dirPath !== '.') {
            const parentPath = path.dirname(dirPath);
            html += `
                <div class="item">
                    <span class="icon">📁</span>
                    <a href="${parentPath === '.' ? '/' : '/' + parentPath}">..</a>
                </div>
            `;
        }

        // Sort items: directories first, then files
        const dirs = items.filter(item => item.isDirectory());
        const files = items.filter(item => !item.isDirectory());
        const sortedItems = [...dirs, ...files];

        // Add items to HTML
        sortedItems.forEach(item => {
            const isDir = item.isDirectory();
            const itemPath = path.join(dirPath === '.' ? '' : dirPath, item.name);
            html += `
                <div class="item">
                    <span class="icon">${isDir ? '📁' : '📄'}</span>
                    <a href="/${itemPath}">${item.name}</a>
                </div>
            `;
        });

        html += `
                </div>
                <script>
                    const evtSource = new EventSource('/live-reload');
                    evtSource.onmessage = function(event) {
                        if (event.data === 'reload') {
                            window.location.reload();
                        }
                    }
                </script>
            </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    });
}

// Store connected clients
const clients = new Set();

// Handle live reload endpoint
server.on('request', (req, res) => {
    if (req.url === '/live-reload') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        clients.add(res);
        req.on('close', () => clients.delete(res));
    }
});

// Watch for file changes
chokidar.watch(['./**/*'], {
    ignored: /node_modules/,
    ignoreInitial: true
}).on('all', (event, path) => {
    console.log(`تغییر فایل: ${path}`);
    clients.forEach(client => client.write('data: reload\n\n'));
});

// Helper function to get content type
function getContentType(filePath) {
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

// Start server
const port = process.argv[2] || 8000;
server.listen(port, () => {
    console.log(`Server Run as http://localhost:${port}`);
    console.log('Ctrl+C for stop server');
});