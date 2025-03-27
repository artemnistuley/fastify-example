'use strict';

const fps = require('node:fs').promises;
const vm = require('node:vm');
const path = require('node:path');
const common = require('../lib/common.js');

const OPTIONS = {
  timeout: 5000,
  displayErrors: false,
};

const load = async (filePath, sandbox) => {
  const src = await fps.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}\n`;
  const script = new vm.Script(code, { ...OPTIONS, lineOffset: -2 });
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  const exported = script.runInContext(context, OPTIONS);
  return exported;
};

const loadDir = async (dir, sandbox) => {
  const files = await fps.readdir(dir, { withFileTypes: true });
  const container = {};
  for (const file of files) {
    const name = file.name;
    if (file.isFile() && !name.endsWith('.js')) continue;
    const location = path.join(dir, name);
    const key = path.basename(name, '.js');
    const loader = file.isFile() ? load : loadDir;
    container[key] = await loader(location, sandbox);
  }
  return container;
};

const loadApp = async ({ logger }) => {
  const sandbox = {
    console: Object.freeze(logger),
    common: Object.freeze(common),
  };

  const configPath = path.join(process.cwd(), './config');
  const domainPath = path.join(process.cwd(), './domain');
  const apiPath = path.join(process.cwd(), './api');

  const config = await loadDir(configPath, sandbox);
  sandbox.config = Object.freeze(config);

  const domain = await loadDir(domainPath, sandbox);
  sandbox.domain = Object.freeze(domain);

  const api = await loadDir(apiPath, sandbox);
  sandbox.api = Object.freeze(api);
  
  return sandbox;
};

module.exports = {
  load,
  loadDir,
  loadApp,
};
