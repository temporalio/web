# Temporal Web UI

[![Build status](https://badge.buildkite.com/72da2011c93761d680bc8c641d07adad16c94b99b0ed8d7566.svg?branch=master)](https://buildkite.com/temporal/temporal-web)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftemporalio%2Ftemporal-web?ref=badge_shield)

> **Nota bene**: The repo is in maintenance mode and will only receive updates for significant bugs. We are focusing efforts on  > the next version of UI:
> - https://github.com/temporalio/ui
> - https://github.com/temporalio/ui-server


Temporal is a distributed, scalable, durable, and highly available orchestration engine we developed at Uber Engineering to execute asynchronous long-running business logic in a scalable and resilient way.

This web UI is used to view workflows from [Temporalio][temporal], see what's running, and explore and debug workflow executions.

For a **video demo** of how this looks, you can [check our docs](https://docs.temporal.io/docs/java-run-your-first-app/#state-visibility).

## Getting Started

### Configuration

Set these environment variables if you need to change their defaults

| Variable                      | Description                                                       | Default                       |
| ----------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| TEMPORAL_GRPC_ENDPOINT        | String representing server gRPC endpoint                          | 127.0.0.1:7233                |
| TEMPORAL_WEB_PORT             | HTTP port to serve on                                             | 8088                          |
| TEMPORAL_CONFIG_PATH          | Path to config file, see [configurations](#configuring-authentication-optional) | ./server/config.yml |
| TEMPORAL_PERMIT_WRITE_API     | Boolean to permit write API methods such as Terminating Workflows | true                          |
| TEMPORAL_WEB_ROOT_PATH        | The root path to serve the app under. Ex. "/test/"                | /                             |
| TEMPORAL_HOT_RELOAD_PORT      | HTTP port used by hot reloading in development                    | 8081                          |
| TEMPORAL_HOT_RELOAD_TEST_PORT | HTTP port used by hot reloading in tests                          | 8082                          |
| TEMPORAL_SESSION_SECRET       | Secret used to hash the session with HMAC                         | "ensure secret in production" |
| TEMPORAL_EXTERNAL_SCRIPTS     | Additional JavaScript tags to serve in the UI                     |                               |
| TEMPORAL_GRPC_MAX_MESSAGE_LENGTH | gRPC max message length (bytes)                                | 4194304 (4mb)                 |
| TEMPORAL_DATA_ENCODER_ENDPOINT | Remote Data Encoder Endpoint, explained below                    |                               |

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
| TEMPORAL_TLS_REFRESH_INTERVAL         | How often to refresh TLS Certs, seconds                             | 0       |
| TEMPORAL_WEB_TLS_CERT_PATH            | Certificate used to support HTTPS in the temporal web UI            |         |
| TEMPORAL_WEB_TLS_KEY_PATH             | Private key for supporting HTTPS in the temporal web UI             |         |

* To enable mutual TLS, you need to specify `TEMPORAL_TLS_KEY_PATH` and `TEMPORAL_TLS_CERT_PATH`.
* For server-side TLS you need to specify only `TEMPORAL_TLS_CA_PATH`.
* To Enable HTTPS in the temporal web UI, specify a `TEMPORAL_WEB_TLS_CERT_PATH` and a `TEMPORAL_WEB_TLS_CERT_PATH` value.

By default we will also verify your server `hostname`, matching it to `TEMPORAL_TLS_SERVER_NAME`. You can turn this off by setting `TEMPORAL_TLS_ENABLE_HOST_VERIFICATION` to `false`.

Setting `TEMPORAL_TLS_REFRESH_INTERVAL` will make the TLS certs reload every N seconds.

</details>

### Configuring Remote Data Encoder (optional)

If you are using a data converter on your workers to encrypt Temporal Payloads you may wish to deploy a remote data encoder so that your users can see the unencrypted Payloads while using Temporal Web. The documentation for the Temporal SDK you are using for your application should include documentation on how to build a remote data encoder. Please let us know if this is not the case. Once you have a remote data encoder running you can configure Temporal Web to use it to decode Payloads for a user in 2 ways:

1. Edit the `server/config.yml` file:

    ```yaml
    data_encoder:
      endpoint: https://remote_encoder.myorg.com
    ```
2. Set the environment variable TEMPORAL_DATA_ENCODER_ENDPOINT to the URL for your remote data encoder. This is often a more convenient option when running Temporal Web in a docker container.

Temporal Web will then configure it's UI to decode Payloads as appropriate via the remote data encoder.

Please note that requests to the remote data encoder will be made from the user's browser directly, not via Temporal Web's server. This means that the Temporal Web server will never see the decoded Payloads and does not need to be able to connect to the remote data encoder. This allows using remote data encoders on internal and secure networks while using an externally hosted Temporal Web instance, such that provided by Temporal Cloud.

### Configuring Authentication (optional)

**Note** For proper security, your server needs to be secured as well and validate the JWT tokens that Temporal Web will be sending to server once users are authenticated. See [security docs](https://docs.temporal.io/docs/server/security/#authorization) for details

Since v1.3, Temporal Web offers optional OAuth SSO authentication. You can enable it in 2 steps:

1. Edit the `server/config.yml` file:

    ```yaml
    auth:
      enabled: true # Temporal Web checks this first before reading your provider config
      providers:
          - label: 'Auth0 oidc'                        # for internal use; in future may expose as button text
            type: oidc                                  # for futureproofing; only oidc is supported today
            issuer: https://myorg.us.auth0.com
            client_id: xxxxxxxxxxxxxxxxxxxx
            client_secret: xxxxxxxxxxxxxxxxxxxx
            scope: openid profile email
            audience: # identifier of the audience for an issued token (optional)
            callback_base_uri: http://localhost:8088
            pass_id_token: false # adds ID token as 'authorization-extras' header with every request to server
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
    - LoginRadius: https://www.loginradius.com/docs/developer/guide/oauth/
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

You can then access Temporal Web at `localhost:8088` (you can configure both the port and the path with `TEMPORAL_WEB_PORT` and `TEMPORAL_WEB_ROOT_PATH` per the config docs above).

For development and contributing to `temporal-web`, please see the [contributing guide](https://github.com/temporalio/temporal-web/blob/master/CONTRIBUTING.md).

You may also use docker by pulling [temporalio/web](https://hub.docker.com/r/temporalio/web/). It is also included in the Temporal server's [local docker setup](https://github.com/temporalio/temporal/tree/master/docker).

### API

If you need to extend `temporal-web` to add middleware to the server, you can install `temporal-web` as a dependency, and it will export the [Koa](http://koajs.com/) web server that has not yet been started or configured. It includes an additional `init` function that will then compose the built-in middleware. This gives you an option to add middleware before or after you call `init` so it will add the middleware at the beginning or the end of the chain, respectively.

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
