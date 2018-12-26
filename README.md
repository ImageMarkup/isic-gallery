ISIC App
===================

- Set ```baseApiUrl``` and ```isicSiteUrl``` in ```appconfig.json```.
Example: ```https://stage.isic-archive.com/api/v1/``` and ```https://stage.isic-archive.com/```
- ```npm install```

### How to run for development

- set ```devHost``` and ```devPort``` in ```appconfig.json```.
- if you start first time you should run ```npm run build```. This command moves static files(images, libs, fonts) to ```codebase``` folder.
- run ```npm start```
- open ```devHost``` in browser


#### Build production files



- ```npm run build```
- copy the "codebase" folder to the production server


