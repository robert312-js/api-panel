[rcon.js](README.md) › [Globals](globals.md)

# rcon.js

# RCON.js
An RCON client for NodeJS developers. 

## Example Usage
```javascript
const {RCONClient} = require('rcon.js');
const client = new RCONClient({
    host: '127.0.0.1',
    port: 25575
});

client.login('password')
    .then(() => {
        client.command('seed')
            .then((response) => console.log(response.body))
    })
```

## Further Documentation
Refer to [docs](./docs/globals.md)
