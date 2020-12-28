# Developing Temporal's Web UI

This doc is intended for contributors to `temporal-web`.

**Note:** All contributors also need to fill out the [Temporal Contributor License Agreement](https://gist.github.com/samarabbas/7dcd41eb1d847e12263cc961ccfdb197) before we can merge in any of your changes.

## Development Environment

You will need Node.js. We recommend Node.js 14. You may wish to use [nvm](https://github.com/creationix/nvm) to manage your versions.

You also need to run [temporal-server](https://github.com/temporalio/temporal) locally or have access to a Temporal environment to talk to.

Here is a [5 minute local dev setup guide for Temporal Web](https://youtu.be/Yss4NrrdB6w) you can follow:

[![http://i3.ytimg.com/vi/Yss4NrrdB6w/hqdefault.jpg](http://i3.ytimg.com/vi/Yss4NrrdB6w/hqdefault.jpg)](https://youtu.be/Yss4NrrdB6w)

## Working with the source code

If you are new to GitHub and open source, you can [follow this guide](https://gist.github.com/Chaser324/ce0505fbed06b947d962) on how to work with a GitHub fork and submit a pull request.

## Building

The standard node.js workflow is used here. We recommend using at least Node v14.

```bash
# before initial setup
make # to set up proto
npm i # to install npm dependencies

# choose either dev or start
npm run dev   # webpack hot reload environment
npm run start     # for production
```

## Testing

Start up the webserver for testing via:

```bash
npm run test-server
```

The open `localhost:8090` in the browser of your choice, or use `npm test` to run it with [mocha-chrome](https://www.npmjs.com/package/mocha-chrome) from the command line. This runs the tests via Chrome in headless mode and shows the results in your terminal.
