/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fsp = require('fs').promises;
const { dirname, basename, join } = require('path');

// const gulp = require('gulp');
// const data = require('gulp-data');
// const rename = require('gulp-rename');
// const logger = require('gulplog');

const fg = require('fast-glob');
const yaml = require('js-yaml');
const through = require('through2');
const ext = require('replace-ext');
const lunr = require('lunr');

const dirs = require('@spectrum-css/bundle-builder/lib/dirs');

// was: buildSite_generateIndex
module.exports = async () => {
  const root_folder = path.join(__dirname, "../../components");

  for await (const file of fg.stream(`${path}/metadata/*.yml`, { onlyFiles: true })) {
  }


function buildSite_generateIndex() {
  return gulp.src([
    `${dirs.components}/*/metadata.yml`,
    `${dirs.components}/*/metadata/*.yml`
  ])
  .pipe(function() {
    let docs = [];
    let store = {};
    let latestFile = null;
    function readYML(file, enc, cb) {
      let componentData;
      try {
        componentData = yaml.safeLoad(String(file.contents));
      } catch (err) {
        return cb(err);
      }

      var componentName = file.dirname.replace('/metadata', '').split('/').pop();

      if (basename(file.basename) === 'metadata.yml') {
        file.basename = componentName;
      }

      var fileName = ext(file.basename, '.html');

      docs.push({
        href: fileName,
        name: componentData.name,
        description: componentData.description
      });

      store[fileName] = {
        href: fileName,
        name: componentData.name,
        component: componentName,
        description: componentData.description
      };

      latestFile = file;

      cb();
    }

    function endStream(cb) {
      let indexFile = latestFile.clone({contents: false});
      indexFile.path = join(latestFile.base, 'index.json');

      let index = lunr(function() {
        this.ref('href');
        this.field('name', { boost: 10 });
        this.field('description');

        docs.forEach(function(doc) {
          this.add(doc);
        }, this);
      });

      // Note: could merge main index here using technique from https://www.garysieling.com/blog/building-a-full-text-index-in-javascript

      indexFile.contents = Buffer.from(JSON.stringify(index, null, 2));
      this.push(indexFile);

      let storeFile = latestFile.clone({contents: false});
      storeFile.path = join(latestFile.base, 'store.json');
      storeFile.contents = Buffer.from(JSON.stringify(store, null, 2));
      this.push(storeFile);

      cb();
    }

    return through.obj(readYML, endStream);
  }())
  .pipe(gulp.dest('dist/docs/'));
}

let buildDocs = gulp.parallel(
  buildSite_generateIndex,
  buildDocs_individualPackages,
);

exports.buildDocs_forDep = buildDocs_forDep;
exports.buildDocs = buildDocs;
exports.build = buildDocs;
