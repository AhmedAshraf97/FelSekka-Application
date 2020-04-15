const express = require ('express');
const joi = require ('joi');
const app  = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT , () => console.log(`Server started on port ${PORT}`));
app.get('/' , (req,res)=> {
  res.send('<h1> Hello world! </h1>');


});
/*var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
  res.end();
}).listen(3000);*/