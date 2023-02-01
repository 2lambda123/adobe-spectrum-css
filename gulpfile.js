
const path = require('path');
const fsp = require('fs').promises;

const builder = require('./tools/bundle-builder');

const gulp = require('gulp');
const replace = require('gulp-replace');

const through = require('through2');
const del = require('del');
const semver = require('semver');

/**
 * The following tasks can be run at root
 * from gulp by name, i.e., `gulp buildComponents`.
 *
 * Tasks imported from builder:
 * - buildComponents (subrunner.buildComponents: runs `build` on all components)
 * - buildCombined (getDependencyOrder, combines theme assets)
 * - buildStandalone (getDependencyOrder, combines theme assets)
 * - buildLite (clean, buildLite on all components, docs.build, & copyPackages)
 *    * @note: on components this = clean, css.buildIndexVars
 * - buildDocs (docs.buildDocs:
 *    ==> buildSite_generateIndex - read in metadata, output index.json, store.json,
 *    ==> buildDocs_individualPackages - renders html output for each component
 *   )
 * - buildDepenenciesOfCommons (runs buildLite on components that leverage commons package)
 * - copyPackages (copies package.json, dist output (but not dist/docs) to root-level dist/components)
 * - copyVars (vars.copyVars:
 *    ==> determines which vars from vars/dist/*.css (!index.css) have been used and outputs them to dist/vars/*-unique.css
 *    ==> copies all spectrum-*.css files from vars/dist to root dist/vars
 *    ==> copies all spectrum-*.css files from expressvars/dist to root dist/expressvars
 *    ==> copies all *.css files from tokens/dist to root dist/tokens
 *   )
 * - dev (devTask:
 *    ==> buildLite & dev.watch at root;
 *    ==> docs.build, copyPackages, & dev.watch in component dirs
 *   )
 * - clean (dist/components, dist/docs/*.html, dist/docs/*.json, !dist/docs/index.html, !dist/docs/get-started.html, !dist/preview/)
 * - build (
 *    clean,
 *    buildIfTopLevel (build on all components, docs.build, buildCombined, buildStandalone, copyPackages),
 *    vars.copyVars
 *   )
 * - watch (dev.watch)
 * - default (buildMedium:
*     ==> clean, buildMedium on all components, docs.build, & copyPackages
 *   )
 * - updateAndTagRelease (release.updateAndTagRelease)
 * - release (updateAndTagRelease, yarnInstall, build, npmPublish, gitPush)
 * - generateChangelog (release.generateChangelog)
 * - buildUniqueVars (vars.buildUnique)
 * - ghPages (release.ghPages)
 * - postPublish (release.releaseBackwardsCompatCleanup)
 * - prePack (build + release.releaseBackwardsCompat)
 */
Object.assign(exports, builder);

/* @todo this can be it's own script */
async function checkPeerDependencies() {
  let packagesDir = './components';

  const components = (await fsp.readdir(packagesDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())
    .map((dirent) => path.join(packagesDir, dirent.name));

  await Promise.all(components.map(async (component) => {
    const package = await fsp.readFile(path.join(component, 'package.json').then(JSON.parse).catch(error => {
      console.trace();
      throw new Error(`Error while parsing JSON: for ${component}: ${err}`);
    }));

    if (!package.peerDependencies) return;

    for (const dependency of Object.keys(package.peerDependencies)) {
      const devDepVer = package.devDependencies[dependency].replace('^', '');
      const peerDepVer = package.peerDependencies[dependency];
      if (!devDepVer) {
        console.warn(`${component} has ${dependency} in peerDependencies, but not devDependencies!`);
        continue;
      }

      if (semver.satisfies(devDepVer, peerDepVer)) continue;

      console.warn(`${component} has out of date peerDependencies ${dependency} (found ${devDepVer}, does not satisfy ${peerDepVer})`);

      // Set a new peer dependency, stripping the beta version number
      const newPeerDepVer = '^' + devDepVer.replace(/-\d+$/, '');
      package.peerDependencies[dependency] = newPeerDepVer
      console.warn(`  Updated ${dependency} to ${newPeerDepVer}`);
    }

    return fsp.writeFile(path.join(component, 'package.json'), JSON.stringify(package, null, 2));
  }));
};

/**
 * Site
 * @todo: pull this out into it's own workflow; github actions maybe?
 **/
exports.prepareSite = gulp.series(
  () => del('dist-site/'),
  gulp.parallel(
    () => gulp.src('dist/docs/**/*').pipe(replace('../components/', 'components/')).pipe(gulp.dest('dist-site/')),
    () => gulp.src('dist/components/**/*', { base: 'dist' }).pipe(gulp.dest('dist-site/')),
    () => gulp.src('dist/preview/**/*', { base: 'dist' }).pipe(gulp.dest('dist-site/')),
  )
);

/* @todo this can be it's own script */
exports.graduatePeerDeps = () =>
  gulp.src('components/*/package.json')
   .pipe(through.obj(function translateJSON(file, enc, cb) {
      let data = JSON.parse(String(file.contents));

      if (data.peerDependencies) {
        for (let [peerDep, version] of Object.entries(data.peerDependencies)) {
          if (version.match(/-(alpha)|(beta)/)) {
            version = version.replace('^', '');
            let newVersion = `^${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
            console.log(`${data.name}: Graduating ${peerDep} to ${newVersion}`);
            data.peerDependencies[peerDep] = newVersion;
          }
        }
      }

      file.contents = Buffer.from(JSON.stringify(data, null, 2));

      cb(null, file);
    }))
    .pipe(gulp.dest('components/'));

/* @todo this can be it's own script */
exports.readmeLint = async () => {
  let packagesDir = './components';

  let components = (await fsp.readdir(packagesDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() || dirent.isSymbolicLink())
    .map((dirent) => path.join(packagesDir, dirent.name));

  await Promise.all(components.map(async(component) => {
    const hasReadme = await fsp.access(path.join(component, 'README.md')).then(v => true).catch(e => false);
    const package = await fsp.readFile(path.join(component, 'package.json').then(JSON.parse).catch(error => {
      console.trace();
      throw new Error(`Error while parsing JSON: for ${component}: ${err}`);
    }));

    if (!hasReadme) {
      console.log(`${package.name}: Writing README...`);
      let content = `# ${package.name}
> ${package.description}

This package is part of the [Spectrum CSS project](https://github.com/adobe/spectrum-css).

See the [Spectrum CSS documentation](https://opensource.adobe.com/spectrum-css/) and [Spectrum CSS on GitHub](https://github.com/adobe/spectrum-css) for details.
`;

      await fsp.writeFile(path.join(component, 'README.md'), content);
    }
  }));
};


/* @todo this can be it's own script */
exports.packageLint = () =>
  gulp.src('components/*/package.json')
   .pipe(through.obj((file, enc, cb) => {
    // Translate JSON
      let data = JSON.parse(String(file.contents));

      if (!data.license) {
        data.license = 'Apache-2.0';
        console.log(`${data.name}: Adding license=${data.license}`);
      }

      if (!data.publishConfig || data.publishConfig.access != 'public') {
        console.log(`${data.name}: Adding publishConfig.access=public`);
        data.publishConfig = data.publishConfig || {};
        data.publishConfig.access = 'public';
      }

      if (!data.repository) {
        console.error(`${data.name}: missing repository field!`);
      }
      else if (!data.repository.directory) {
        data.repository.directory = 'components/' + data.name.split('/').pop();
        console.log(`${data.name}: Adding missing repository.directory=${data.repository.directory}`);
      }

      if (data.author === '') {
        console.log(`${data.name}: Author field empty, deleting`);
        delete data.author;
      }

      if (!data.homepage) {
        data.homepage = 'https://opensource.adobe.com/spectrum-css/';
        console.log(`${data.name}: Adding homepage=${data.homepage}`);
      }

      file.contents = Buffer.from(JSON.stringify(data, null, 2));

      cb(null, file);
    }))
   .pipe(gulp.dest('components/'));

exports.checkPeerDependencies = checkPeerDependencies;

exports.version = gulp.series(
  checkPeerDependencies,
  builder.build
);

exports['watch-relaunch'] = builder.watch;
exports.default = builder.buildMedium;
