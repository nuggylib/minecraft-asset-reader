#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require('../out/cli').cli(process.argv);