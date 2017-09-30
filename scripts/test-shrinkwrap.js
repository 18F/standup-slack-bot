/* eslint-disable no-console */

const shrinkwrap = require('../npm-shrinkwrap.json');

const failed = [];

function checkDependency(name, dependency) {
  if (dependency.resolved) {
    if (dependency.resolved.startsWith('http://')) {
      failed.push({
        name,
        version: dependency.version,
        resolved: dependency.resolved
      });
    }
  }

  if (dependency.dependencies) {
    for (const key of Object.keys(dependency.dependencies)) {
      checkDependency(key, dependency.dependencies[key]);
    }
  }
}

for (const key of Object.keys(shrinkwrap.dependencies)) {
  checkDependency(key, shrinkwrap.dependencies[key]);
}

if (failed.length) {
  console.log('npm-shrinkwrap.json is vulnerable to HTTP injection:');
  for (const dependency of failed) {
    console.log(` --> ${dependency.name}@${dependency.version} has URL ${dependency.resolved}`);
  }
  process.exit(1);
}
