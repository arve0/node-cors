var http = require("http");
var https = require("https");
var URL = require("url");

var validURL = /^https?:\/\/[a-z\u00a1-\uffff0-9]+/;

module.exports = app;
function app(request, response) {
  response.on("error", handleError(response, request));
  request.on("error", handleError(response, request));

  var body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", proxyRequest);

  function proxyRequest() {
    var requestedURL = request.url.slice(1);
    if (requestedURL === "") {
      // INDEX
      response.write("Usage: http://" + request.headers.host + "/URL");
      response.end();
      return;
    } else if (requestedURL.search(validURL) !== 0) {
      // INVALID URL
      response.statusCode = 500;
      response.write("URL must be valid, got: " + requestedURL);
      response.end();
      return;
    } else {
      // PROXY REQUEST
      var url = URL.parse(requestedURL);
      var options = {
        headers: request.headers,
      };
      options.headers.host = url.host;
      delete options.headers.connection;
      options.method = request.method;

      console.log(options.method, requestedURL);
      console.log("REQUEST HEADERS\n", options.headers);
      console.log("REQUEST BODY\n", body);

      var responseBody = "";
      if (requestedURL.slice(0, 5) === "https") {
        https
          .request(requestedURL, options, handleResponse(response))
          .on("error", handleError(response))
          .end(body);
      } else {
        http
          .request(requestedURL, options, handleResponse(response))
          .on("error", handleError(response))
          .end(body);
      }
    }
  }
}

function handleError(response) {
  return function (err) {
    console.error(err.message);
    console.error(err.stack);

    // send error
    response.statusCode = 500;
    response.write("Error.");
    response.end();
  };
}

function handleResponse(response) {
  return function (res) {
    response.statusCode = res.statusCode;

    var body = "";

    res.on("data", (chunk) => {
      body += chunk;
      response.write(chunk);
    });
    res.on("close", done);

    function done(err) {
      if (err) {
        handleError(response)(err);
        return;
      }

      console.log("RESPONSE STATUS\n", res.statusCode);
      console.log("RESPONSE HEADERS\n", res.headers);
      console.log("RESPONSE BODY\n", body);

      response.end(err);
    }
  };
}
