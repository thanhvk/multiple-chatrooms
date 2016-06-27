var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var chatServer = require('./chat_server.js');

var server = http.createServer((req, res) => {
	var filePath = false;

	if (req.url === '/')  {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + req.url;
	}

	var absPath = './' + filePath;
	serveStatic(res, cache, absPath);
});

chatServer.listen(server);

server.listen(3000, () => {
	console.log('Server listening on port 3000');
});

function send404(res) {
	res.writeHead(404, {
		'Content-Type': 'text/plain'
	});
	res.end('Error 404: resource not found.');
}

function sendFile(res, filePath, fileContent) {
	res.writeHead(200, {
		'Content-Type': mime.lookup(path.basename(filePath))
	})
	res.write(fileContent);
	res.end();
}

function serveStatic(res, cache, absPath) {
	// if (cache[absPath]) {
	// 	sendFile(res, absPath, cache[absPath])
	// } else {
		fs.stat(absPath, (err, Stats) => {
			if (err) {
				send404(res);
			} else {
				fs.readFile(absPath, (err, data) => {
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			}
		});
	// }
}