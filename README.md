# Node HTTP proxy

Usage:
```sh
PORT=9090 node server.js
```

Port defaults to `8000`. Or use as middleware:

```js
const express = require('express')
const app = express()
const cors = require('./node-cors')

app.use('/path', cors)

app.listen(8000)
```
