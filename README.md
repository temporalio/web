# Temporal Web UI

[![Build status](https://badge.buildkite.com/72da2011c93761d680bc8c641d07adad16c94b99b0ed8d7566.svg?branch=master)](https://buildkite.com/temporal/temporal-web)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web?ref=badge_shield)

Temporal is a distributed, scalable, durable, and highly available orchestration engine we developed at Uber Engineering to execute asynchronous long-running business logic in a scalable and resilient way.

This web UI is used to view workflows from [Temporalio][temporal], see what's running, and explore and debug workflow executions.

## Getting Started

### Configuration

Set these environment variables if you need to change their defaults

| Variable                      | Description                                                       | Default                       |
| ----------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| TEMPORAL_GRPC_ENDPOINT        | String representing server gRPC endpoint                          | 127.0.0.1:7233                |
| TEMPORAL_WEB_PORT             | HTTP port to serve on                                             | 8088                          |
| TEMPORAL_CONFIG_PATH          | Path to config file, see [configurations](#configuring-authentication-optional) | ./server/config.yml   
| TEMPORAL_PERMIT_WRITE_API     | Boolean to permit write API methods such as Terminating Workflows | true                          |
| TEMPORAL_HOT_RELOAD_PORT      | HTTP port used by hot reloading in development                    | 8081                          |
| TEMPORAL_HOT_RELOAD_TEST_PORT | HTTP port used by hot reloading in tests                          | 8082                          |
| TEMPORAL_SESSION_SECRET       | Secret used to hash the session with HMAC                         | "ensure secret in production" |
| TEMPORAL_EXTERNAL_SCRIPTS     | Additional JavaScript tags to serve in the UI                     |                               |

<details>
<summary>
Optional TLS configuration variables:
</summary>

| Variable                              | Description                                                         | Default |
| ------------------------------------- | ------------------------------------------------------------------- | ------- |
| TEMPORAL_TLS_CERT_PATH                | Certificate for the server to validate the client (web) identity    |         |
| TEMPORAL_TLS_KEY_PATH                 | Private key for secure communication with the server                |         |
| TEMPORAL_TLS_CA_PATH                  | Certificate authority (CA) certificate for the validation of server |         |
| TEMPORAL_TLS_ENABLE_HOST_VERIFICATION | Enables verification of the server certificate                      | true    |
| TEMPORAL_TLS_SERVER_NAME              | Target server that is used for TLS host verification                |         |

To enable TLS, you need to specify `TEMPORAL_TLS_CA_PATH`, `TEMPORAL_TLS_KEY_PATH`, and `TEMPORAL_TLS_CERT_PATH`. 

By default we will also verify your server `hostname`, matching it to `TEMPORAL_TLS_SERVER_NAME`. You can turn this off by setting `TEMPORAL_TLS_ENABLE_HOST_VERIFICATION` to `false`.

</details>

### Configuring Authentication (optional)

> ⚠️ This is currently a beta feature, [please report any and all issues to us!](https://github.com/temporalio/web/issues/new)

Since v1.3, Temporal Web offers optional OAuth SSO authentication. You can enable it in 2 steps:

1. Edit the `server/config.yml` file:

    ```yaml
    auth:
      enabled: true # Temporal Web checks this first before reading your provider config
      providers:
          - label: 'google oidc'                        # for internal use; in future may expose as button text
            type: oidc                                  # for futureproofing; only oidc is supported today
            issuer: https://accounts.google.com
            client_id: xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
            client_secret: xxxxxxxxxxxxxxxxxxxxxxx
            scope: openid profile email
            audience: temporal # identifier of the audience for an issued token (optional)
            callback_base_uri: http://localhost:8088
    ```

    <details>
    <summary>
    Providing <code>config.yml</code> to Docker image
    </summary>


    If you are running Temporal Web from the docker image, you can provide your external config.yml to docker to override the internal config. 
    Create config.yml file on your machine, for example at `~/Desktop/config.yml`. 
    Start the docker image, providing the path to your config.yml file using external volume flag (-v). Leave the path after the semicolon as is: 

    ```bash
    docker run --network host -v ~/Desktop/config.yml:/usr/app/server/config.yml temporalio/web:latest
    ```

    </details>

    In future, multiple Oauth providers may be supported, however for now we only read the first Oauth provider under the `providers` key above.

    Common Oauth Providers and their docs:

    - Google: https://developers.google.com/identity/protocols/oauth2/openid-connect
    - Auth0: https://auth0.com/docs/protocols/configure-okta-as-oauth2-identity-provider
    - Okta: https://help.okta.com/en/prod/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm
        <details>
          <summary>
            Troubleshooting note for Okta users:
          </summary>
          Some providers like Okta, have a race condition that may cause logins to occasionally fail. You can get around this by providing the full URL to the `openid-configuration` path as part of the `issuer` parameter:

        ```yaml
          auth:
            enabled: true
            providers:
                - label: 'okta dev'
                  type: oidc
                  issuer: https://dev-xxxxxxx.okta.com/.well-known/openid-configuration
                  ...
        ```
      </details>
    - Keycloak: https://www.keycloak.org/getting-started/getting-started-docker
    - please feel free to [PR or request more help on the Temporal Web repo](https://github.com/temporalio/web/)

2. You will need to provide a redirect URL to your Oauth Provider. If you are hosting Temporal Web at `http://localhost:8088` (this is configured by `callback_base_uri` in `server/config.yml`), then it is `http://localhost:8088/auth/sso_callback`. 

    - By default, Temporal Web asks for 3 scopes, make sure your provider recognizes these or you may see scope-related errors:
      - `openid` required by some OIDC providers like [auth0](https://auth0.com/docs/scopes/openid-connect-scopes)
      - `profile` for name
      - `email` for email

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
var app = require('temporal-web');
var createStatsd = require('uber-statsd-client');
var sdc = createStatsd({
  host: 'statsd.example.com',
});

app
  .use(async function(ctx, next) {
    sdc.increment('http.request');
    await next();
  })
  .init()
  .listen(7000);
```

The [webpack](https://webpack.js.org/) configuration is also exported as `webpackConfig`, and can be modified before calling `init()`.

### Licence

MIT License, please see [LICENSE](https://github.com/temporalio/temporal-web/blob/master/LICENSE) for details.

[temporal]: https://github.com/temporalio/temporal

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web?ref=badge_large)
