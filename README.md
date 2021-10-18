ISIC App
===================

### Building for production
- Set the environment variables:
  - `ISIC_BASE_API_URL` to the absolute URL of the ISIC API root
    - this must include a trailing slash
    - e.g. this value may be `https://sandbox.isic-archive.com/api/v1/` for testing
  - `ISIC_SITE_URL` to the absolute URL of where this app will be served
    - this is similar to [Webpack's `publicPath`](https://webpack.js.org/configuration/output#outputpublicpath)
    - e.g. this value may be `https://beta.isic-archive.com/` for testing
  - `ISIC_AUTHORIZATION_SERVER` to the absolute URL of authorization server
    - e.g. this value may be `https://api-sandbox.isic-archive.com`
  - `ISIC_CLIENT_ID` to the client identifier
  - `AUTHORIZATION_MODE` to the authorization mode
    - application uses OAuth2 as default authorization mode. If you need to use the old authorization method set value `Legacy`
- Run `npm ci`
- Run `npm run build`
- Deploy all files from the `codebase/` directory to be served directly beneath the HTTP root path (`/`)
  - this is equivalent to [Apache's `DocumentRoot "codebase"`](https://httpd.apache.org/docs/2.4/mod/core.html#documentroot)
  - e.g. a request for `https://beta.isic-archive.com/app.js` serves the file `codebase/app.js`
- Configure the file at `codebase/index.html` to be served in response to requests for the HTTP root path (`/`) itself
  - this is similar to [Apache's `DirectoryIndex`](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#directoryindex)
  - e.g. a request for `https://beta.isic-archive.com/` serves the file `codebase/index.html`
- Configure the file at `codebase/error.html` to be served as the body of 404 error responses, when a requested file cannot be found by the server
  - this is similar to [Apache's `FallbackResource`](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#fallbackresource)
  - e.g. a request for `https://beta.isic-archive.com/someotherthing.foo` serves the file `codebase/error.html`
- Configure the directory at `codebase/sources/filesForDownload` to be served with the HTTP `Content-Disposition: attachment` header

### How to run for development

- set ```devHost``` and ```devPort``` in ```appconfig.json```.
- set the environment variables.
- if you start first time you should run ```npm run build```. This command moves static files(images, libs, fonts) to ```codebase``` folder.
- run ```npm start```.
- open ```devHost``` in browser.