var http = require('http');
var port = 3000;
http.createServer(function(req,res){ 
  res.writeHead(200,{'Content-Type':'test/plain'});
  res.end('Hello world!\n');
}).listen(port);
console.log('Listening on port',port);
