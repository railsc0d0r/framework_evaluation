#!/usr/bin/env node
"use strict";
const initApp = require('./server/initApp');

//noinspection ES6ModulesDependencies,ES6ModulesDependencies
const port = process.env.PORT || 3000;

initApp().then(app => {
  const server = app.listen(port);
  console.log('Server listens on ' + server.address().port);
}).catch(msg => {
  console.log(msg);
  process.exit(1);
});
