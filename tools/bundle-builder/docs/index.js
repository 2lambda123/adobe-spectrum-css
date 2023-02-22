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

const fsp = require("fs").promises;
const path = require("path");

const fg = require("fast-glob");
const yaml = require("js-yaml");
const ext = require("replace-ext");
const lunr = require("lunr");
const npmFetch = require("npm-registry-fetch");
const nunjucks = require("nunjucks");

const dirs = require("../lib/dirs");
const depUtils = require("../lib/depUtils");

const minimumDeps = [
  'icon',
  'statuslight',
  'link',
  'page',
  'site',
  'typography',
  'tooltip',
  'sidenav',
  'actionbutton',
  'button',
  'textfield',
  'clearbutton',
  'search',
  'menu',
  'fieldlabel',
  'picker',
  'popover',
  'underlay',
  'card',
  'divider',
  'illustratedmessage',
  'accordion',
  'table'
];

const templateData = {
  nav: [],
  pkg: await fsp.readFile('package.json', 'utf8').then(JSON.parse).catch(console.warn),
};

const walk = async (dir, dest) => {
  const promises = [];
  for (const file of await fsp.readdir(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, file.name);
    const destDir = path.join(dest, file.name);
    if (file.isDirectory()) {
      await fsp.mkdir(destDir).catch();
      promises.push(
        walk(filePath, destDir)
      );
      continue;
    }

    promises.push(
      fsp.copyFile(filePath, path.join(dest, path.basename(filePath)))
    );
  }
  return Promise.all(promises);
};

const buildDocs_forDep = async (dep) => {
  // Drop package org
  dep = dep.split('/').pop();
  const packagePath = require.resolve(`@spectrum-css/${dep}/package.json`);
  const metadataPath = require.resolve(`@spectrum-css/vars/dist/spectrum-metadata.json`);
  if (!packagePath) return;

  const metadata = await fsp.readFile(metadataPath).then(JSON.parse).catch(console.warn);
  const dependencyOrder = await depUtils.getPackageDependencyOrder(path.dirname(packagePath));

  const dirName = `${dirs.components}/${dep}`;
  const componentDeps = dependencyOrder.map((dep) => dep.split('/').pop());
  componentDeps.push(dep);

  const pkg = await fsp.readFile(path.join(dirs.components, dep, 'package.json')).then(JSON.parse).catch(console.warn);

  let docsDeps = minimumDeps.concat(componentDeps);
  docsDeps = docsDeps.filter((dep, i) => docsDeps.indexOf(dep) === i);

  const date = await npmFetch.json(pkg.name).then((data) => {
    const date = data.time[pkg.version];
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }).catch(() => {
    console.warn(`Could not determine date of release for ${pkg.name}@${pkg.version}`);
    return 'Unreleased';
  });

  const siteData = {
    util: require(`${dirs.site}/util`),
    dnaVars: metadata,
    ...templateData,
    pageURL: path.basename(dep, '.yml') + '.html',
    dependencyOrder: docsDeps,
    releaseDate: date,
    pkg: pkg
  };

  let file = {};
  for (const filePath of await fg([
    'metadata/*.yml'
  ], {
    cwd: dirName,
    absolute: true
  })) {
    // const componentName = filePath.replace('/metadata', '').split('/').pop();
    file.basename = path.basename(filePath);
    const component = fsp.readFile(filePath, 'utf-8').then(yaml.safeLoad).catch(console.warn);
    file.path = path.basename(filePath);
    file.data = component;
    component.id = component.id ?? path.basename(filePath, '.yml');

    require(`${dirs.site}/util`).populateDNAInfo(component, metadata);

    // Arrange examples for processing
    const examples = !component.examples ? [component] : Array.isArray(component.examples) ? component.examples : Object.values(component.examples);
    for (const example in examples) {
      if (example.dnaStatus === 'Deprecated' || example.cssStatus === 'Deprecated') {
        example.status = 'Deprecated';
      } else if (example.cssStatus === 'Verified' || example.dnaStatus === 'Canon') {
        example.status = 'Verified';
      } else example.status = 'Contribution';
    }

    const dnaStatusTranslation = {
      'Canon': 'Verified',
      'Precursor': 'Contribution'
    };

    file.path = ext(file.path, '.html');
    const compiled = nunjucks.render(`${dirs.site}/content/_includes/siteComponent.njk`, {
      ...siteData || {},
      component,
      status: dnaStatusTranslation[component.dnaStatus] || component.dnaStatus,
    });

    if (!compiled) return;
    return fsp.writeFile(path.join(__dirname, `../../../dist/docs/${path.basename(filePath, '.yml')}.html`), compiled);
  }
}

/**
 * @description This will loop through each file in the metadataFiles array,
 * read the contents of the file
 * using the fs module's readFileSync method, perform any necessary t
 * ransformations on the contents, and then add an entry to the nav array for each file.
 * Finally, the nav array is sorted and assigned to the templateData.nav property.
 */
const buildSite_getData = async () => {
  const nav = [];
  for (const file of await fg([
    `*/metadata/*.yml`,
  ], {
    cwd: dirs.components,
    absolute: true
  })) {
    const componentData = fsp.readFile(file, "utf8").then(yaml.safeLoad).catch(console.warn);
    nav.push({
      ...componentData || {},
      component: path.dirname(file).replace("/metadata", "").split("/").pop(),
      href: ext(path.basename(file), ".html"),
    });
  }

  templateData.nav = nav.sort((a, b) => a.name <= b.name ? -1 : 1);
}

// copy all the resources from site/dist to dist/docs
const buildSite_copyResources = async () => {
  const distPath = path.join(__dirname, "../../dist/docs/");
  await fsp.mkdir(distPath, { recursive: true }).catch();
  return walk(`${dirs.site}/dist/`, distPath);
}

/**
 * @returns {Promise<void>}
 * @description This will loop through each file in the siteFiles array,
 * read the contents of the file
 * using the fs module's readFileSync method, perform any necessary transformations
 * on the contents using the nunjucksRender function, and then write
 * the transformed contents to a new file in the dist/docs/
 * directory using the fs module's writeFileSync method.
 */
const buildSite_html = async () => {
  const promises = [];
  for (const file of await fg(`content/**/*.njk`, {
    extend: ["njk"],
    absolute: true,
    cwd: dirs.site,
  }) ) {
    const fileContents = await fsp.readFile(file, "utf8");
    const transformedContents = nunjucks.renderString(
      "site/templates",
      fileContents
    );

    await fsp.mkdir("dist/docs/", { recursive: true }).catch();
    promises.push(
      fsp.writeFile(
        `dist/docs/${path.basename(file, ".njk")}.html`,
        transformedContents
      )
    );
  }
  return Promise.all(promises);
}

// build all the site pages
const buildSite_pages = async () =>
  Promise.all([
    buildSite_getData(),
    buildSite_html(),
]);

exports.buildSite = async () =>
  Promise.all([
    buildSite_copyResources(),
    buildSite_pages()
]);

/**
 * @description This will first run the buildSite_getData function,
 * and then run the buildSite_generateIndex,
 * buildDocs_individualPackages, buildSite_copyResources, and copySiteWorkflowIcons
 * functions in parallel. The callback function will be invoked
 * when all of the tasks in the series have completed.
 */
const buildDocs = async () => {
  await buildSite_getData().catch(console.warn);
  return Promise.all([
    // was: buildSite_generateIndex
    async () => {
      const docs = [];
      const store = {};

      for (const component of await fg([
        `*/metadata/*.yml`
      ], {
        cwd: dirs.components,
        absolute: true,
      })) {
        const componentData = await fsp.readFile(component).then(yaml.safeLoad).catch(console.warn);
        const componentName = path.dirname(component).replace('/metadata', '').split('/').pop();
        const fileName = ext(path.basename(component), '.html');

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
      }

      const indexContent = lunr(() => {
          this.ref('href');
          this.field('name', { boost: 10 });
          this.field('description');

          docs.forEach(function(doc) {
            this.add(doc);
          }, this);
      }).then(JSON.stringify).catch(console.warn);

      await fsp.mkdir('dist/docs/', { recursive: true }).catch();
      return Promise.all([
        fsp.writeFile('dist/docs/index.json', Buffer.from(indexContent)),
        fsp.writeFile('dist/docs/store.json', JSON.stringify(store)),
      ]);
    },
    // was: buildDocs_individualPackages
    async () => {
      const dependencies = await depUtils.getFolderDependencyOrder(
        dirs.components
      );
      if (!dependencies) return Promise.resolve();
      return Promise.all(dependencies.map(buildDocs_forDep));
    },
    buildSite_copyResources(),
    async () => {
      const sourcePath = require.resolve("@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg");
      return fsp.copyFile(sourcePath, 'dist/docs/img/spectrum-icons.svg');
    },
  ]);
}

exports.buildSite_getData = buildSite_getData;
exports.buildSite_copyResources = buildSite_copyResources;

exports.buildSite_copyFreshResources = async () => {
  const distPath = path.join(__dirname, "../../dist/docs/");
  await fsp.mkdir(distPath, { recursive: true }).catch();
  return walk(`${dirs.site}/resources/`, distPath);
};

exports.buildSite_pages = buildSite_pages;
exports.buildSite_html = buildSite_html;
exports.buildDocs_forDep = buildDocs_forDep;
exports.buildDocs = buildDocs;

exports.build = async () => {
  await buildSite_getData().catch(console.warn);
  return buildDocs().catch(console.warn);
};
