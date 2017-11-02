import path = require('path');
import childProcess = require('child_process');
import utils = require('./utils');


// Make sure we have required command line arguments.
if (process.argv.length !== 3) {
  let msg = '** Must supply an update specifier\n';
  process.stderr.write(msg);
  process.exit(1);
}

// Extract the desired library target and specifier.
let parts = process.argv[2].split('@');

// Translate @latest to a concrete version.
if (parts.length === 1 || parts[1] === 'latest') {
  let cmd = 'npm view ' + parts[0] + ' version';
  parts.push('~' + String(childProcess.execSync(cmd)).trim());
}
let name = parts[0];
let specifier = parts[1];


// Handle the packages
utils.getLernaPaths().forEach(pkgPath => {
  handlePackage(pkgPath);
});
handlePackage(path.resolve('.'));


/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath: string): void {
  // Read in the package.json.
  packagePath = path.join(packagePath, 'package.json');
  let data: any;
  try {
    data = require(packagePath);
  } catch (e) {
    console.log('Skipping package ' + packagePath);
    return;
  }

  // Update dependencies as appropriate.
  if (name in data['dependencies']) {
    data['dependencies'][name] = specifier;
  } else if (name in data['devDependencies']) {
    data['devDependencies'][name] = specifier;
  }

  // Write the file back to disk.
  utils.ensurePackageData(data, packagePath);
}
