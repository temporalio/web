# Temporal Web UI

[![Build status](https://badge.buildkite.com/72da2011c93761d680bc8c641d07adad16c94b99b0ed8d7566.svg?branch=master)](https://buildkite.com/temporal/temporal-web)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web?ref=badge_shield)

Temporal is a distributed, scalable, durable, and highly available orchestration engine we developed at Uber Engineering to execute asynchronous long-running business logic in a scalable and resilient way.

This web UI is used to view workflows from [Temporalio][temporal], see what's running, and explore and debug workflow executions.

## Getting Started

### Configuration

Set these environment variables if you need to change their defaults

| Variable                  | Description                                   | Default           |
| ------------------------- | --------------------------------------------- | ----------------- |
| TEMPORAL_GRPC_ENDPOINT    | String representing server gRPC endpoint      | 127.0.0.1:7233    |
| TEMPORAL_WEB_PORT         | HTTP port to serve on                         | 8088              |
| TEMPORAL_EXTERNAL_SCRIPTS | Addtional JavaScript tags to serve in the UI  |                   |

### Running locally

`temporal-web` uses all the standard [npm scripts](https://docs.npmjs.com/misc/scripts) to install dependencies, run the server, and run tests. Additionally to run locally with webpack hot reloading and other conveniences, use

```
make
npm run dev
```

For development and contributing to `temporal-web`, please see the [contributing guide](https://github.com/temporalio/temporal-web/blob/master/CONTRIBUTING.md).

You may also use docker by pulling [temporalio/web](https://hub.docker.com/r/temporalio/web/). It is also included in the Temporal server's [local docker setup](https://github.com/temporalio/temporal/tree/master/docker).

### API

If you need to extend `temporal-web` to add middleware to the server, you can install `temporal-web` as a dependecy, and it will export the [Koa](http://koajs.com/) web server that has not yet been started or configured. It includes an additional `init` function that will then compose the built-in middleware. This gives you an option to add middleware before or after you call `init` so it will add the middleware at the beginning or the end of the chain, respectively.

#### `init(options)`

All options are optional.

`useWebpack`: If `true`, starts webpack and adds the middleware, otherwise if `false`, it assumes the UI bundle was already built and serves it statically. Defaults to `process.env.NODE_ENV === 'production'`.

`logErrors`: If `true`, thrown errors are logged to `console.error`. Defaults to `true`.

For example, here is how you would add a request count metric using `uber-statsd-client`:

```javascript
var app = require('temporal-web')
var createStatsd = require('uber-statsd-client')
var sdc = createStatsd({
    host: 'statsd.example.com'
})

app.use(async function(ctx, next) {
  sdc.increment('http.request')
  await next()
})
.init()
.listen(7000)
```


The [webpack](https://webpack.js.org/) configuration is also exported as `webpackConfig`, and can be modified before calling `init()`.

### Licence

MIT License, please see [LICENSE](https://github.com/temporalio/temporal-web/blob/master/LICENSE) for details.

[temporal]: https://github.com/temporalio/temporal


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web?ref=badge_large)