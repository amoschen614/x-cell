var http = require('http');
var express = require('express');
var app = express();

app.use(express.static('public'));
app.set('port', process.env.PORT || 5000);

var server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}...`);
});