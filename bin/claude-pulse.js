#!/usr/bin/env node
'use strict';

const path = require('path');

// Resolve server.js relative to this file so it works regardless of
// where the user's cwd is when they run `claude-pulse`.
process.chdir(path.join(__dirname, '..'));
require('../server.js');
