var http = require('http');
var https = require('https');
var url = require('url');

var validURL = /^https?:\/\/[a-z\u00a1-\uffff0-9]+/;

module.exports = app
function app (request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');

  response.on('error', handleError(response, request));
  request.on('error', handleError(response, request));

  if (request.method !== 'GET') {
    // fail
    response.statusCode = 500;
    response.write('Server only support GET requests.');
    response.end();
    return;
  }

  var requestedURL = request.url.slice(1);
  if (requestedURL === '') {
    // INDEX
    response.write('Usage: http://' + request.headers.host + '/URL');
    response.end();
    return;
  } else if (requestedURL.search(validURL) !== 0) {
    // INVALID URL
    response.statusCode = 500;
    response.write('URL must be valid, got: ' + requestedURL);
    response.end();
    return;
  } else {
    // PROXY REQUEST
    var options = url.parse(requestedURL);
    options.headers = stripHeaders(request.headers);

    if (requestedURL.slice(0, 5) === 'https') {
      https.get(options, handleGet(response, request))
          .on('error', handleError(response, request));
    } else {
      http.get(options, handleGet(response, request))
          .on('error', handleError(response, request));
    }
  }
}

function handleError (response, request) {
  return function (err) {
    console.error(err.stack);
    // send error
    response.statusCode = 500;
    response.write('Error.');
    response.end();
  }
}

function handleGet (response, request) {
  return function (res) {
    response.statusCode = res.statusCode;

    for (var header in res.headers) {
      if (header === 'access-control-allow-origin' || !res.headers.hasOwnProperty(header)) {
        continue;
      }
      response.setHeader(header, res.headers[header]);
    }

    res.on('data', response.write.bind(response));
    res.on('end', response.end.bind(response));
  }
}

function stripHeaders (headers) {
  var strippedHeaders = {};
  for (var header in headers) {
    if (header !== 'host' &&
        header !== 'origin' &&
        headers.hasOwnProperty(header)) {
      strippedHeaders[header] = headers[header];
    }
  }
  return strippedHeaders;
}
