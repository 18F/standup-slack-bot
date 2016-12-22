const shrinkwrap = require('../npm-shrinkwrap.json');
const failed = [ ];

function checkDependency(name, dependency) {
  if(dependency.resolved) {
    if(dependency.resolved.startsWith('http://')) {
      failed.push({
        name,
        version: dependency.version,
        resolved: dependency.resolved
      });
    }
  }

  if(dependency.dependencies) {
    for(let key in dependency.dependencies) {
      checkDependency(key, dependency.dependencies[key]);
    }
  }
}

for(let key in shrinkwrap.dependencies) {
  checkDependency(key, shrinkwrap.dependencies[key]);
}

if(failed.length) {
  console.log('npm-shrinkwrap.json is vulnerable to HTTP injection:');
  for(let dependency of failed) {
    console.log(` --> ${dependency.name}@${dependency.version} has URL ${dependency.resolved}`);
  }
  process.exit(1);
}
