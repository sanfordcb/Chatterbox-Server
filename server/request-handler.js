

var urlParser = require('url');

var All_Messages = [];

var objectId = 1;

var routes = {
  '/classes/chatterbox': true,
  '/classes/room1': true,
  '/classes/messages': true
}

var actions = {
  "GET": function(request, response) {
    sendResponse(response, {results: All_Messages});
  },
  "POST": function(request, response) {
    collectData(request, function(message) {
      All_Messages.push(message);
      message.objectId = objectId++;
      sendResponse(response, {objectId: objectId}, 201);
    });
  },
  "OPTIONS": function(request, response) {
    sendResponse(response);
  } 
};

var collectData = function(request, callback) {
  var data = '';
  request.on('data', function(chunk) {
    data += chunk;
  });
  request.on('end', function() {
    callback(JSON.parse(data));
  });
};

var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var requestHandler = function(request, response) {

  var method = request.method;
  
  var parts = urlParser.parse(request.url);
  //console.log(parts);
  var route = routes[parts.pathname];
  //console.log(route);
  
  
  var action = actions[method];
  if(action && route) {
    action(request, response);
  } else {
    sendResponse(response, 'Not Found', 404);
  }
  
  
};  
  
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-type": "application/json"
};

exports.requestHandler = requestHandler;
  
  /*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.
#####
You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.
#####
Maintains access to defaultCorsHeads by closure
#####
*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
  
  
  
  
  
  
  // event listeners for data and errors
 
  
    
  // response.statusCode = 200;
  // response.setHeader('Content-type', 'application/json');
  
  // var responseBody = {
  //   headers: headers,
  //   method: method,
  //   url: url,
  //   body: body
  // };
    
  // response.write(JSON.stringify(responseBody));
  // response.end();

/*
  if(request.method === 'GET') {
    if(request.url === '') {
      response.writeHead(404);
      response.end();
    } else {
      response.writeHead(200);
      response.end();
    }
  } else if(request.method === 'POST') {
    if(request.url === '') {

    }
  }
  
 console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;

  var headers = defaultCorsHeaders;

   headers['Content-Type'] = "text/plain";

  response.writeHead(statusCode, headers);

  
  response.end("Hello, World!");
  */


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
