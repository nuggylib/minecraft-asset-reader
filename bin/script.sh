#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require('../out/main').cli(process.argv);