ISIC App
===================

- Set ```ISIC_BASE_API_URL``` and ```ISIC_SITE_URL``` in ```webpack.config.js``` in ```Environment plugin````.
Example: ```https://sandbox.isic-archive.com/api/v1/``` and ```https://isic-archive.com/```
- ```npm install```

### How to run for development

- set ```devHost``` and ```devPort``` in ```appconfig.json```.
- if you start first time you should run ```npm run build```. This command moves static files(images, libs, fonts) to ```codebase``` folder.
- run ```npm start```
- open ```devHost``` in browser


#### Build production files



- ```npm run build```
- copy the "codebase" folder to the production server
- configure your HTTP server to ensure that files served from `codebase/sources/filesForDownload` are given a `Content-Disposition: attachment` header

