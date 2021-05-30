#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require('../out/cli/src/main').cli(process.argv);
