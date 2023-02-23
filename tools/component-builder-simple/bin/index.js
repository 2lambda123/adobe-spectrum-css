#!/usr/bin/env node

/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require('fs');
const fsp = fs.promises;
const path = require("path");

const del = require('del');

const yargs = require("yargs");
const chalk = require('chalk');
// const boxen = require('boxen');

const buildCSS = require('../css');

const isComponentDir = (cwd = process.cwd()) => {
  if (!cwd) return false;
  return cwd.includes('/components/');
};

const isRootDir = (cwd = process.cwd()) => {
  return fsp.access(path.join(cwd, 'package.json'), fs.constants.R_OK)
    .catch(() => false)
    .then(() => {
      const { name } = require(path.join(cwd, 'package.json'));
      return name === 'spectrum-css-monorepo';
    });
};

async function clean({ verbose = true, cwd = process.cwd()}) {
  if (verbose) console.log(chalk.yellow(`@spectrum-css/${cwd.split(path.sep).pop().trim()}`), `| cleaning compiled assets`);
  const deletedPaths = await del('dist/*', { cwd });
  if (verbose) console.log(`  ${chalk.green(`✓`)} ${deletedPaths.length} files deleted`);
  return Promise.resolve();
}

const build = async ({ verbose = true, cwd = process.cwd() } = {}) => {
  return buildCSS({ verbose, cwd }).catch(err => err && Promise.reject(err)).then(() => {
    return fsp.copyFile(path.join(cwd, 'dist/index.css'), path.join(cwd, 'dist/index-vars.css')).then(() => {
      if (verbose) console.log(`  ${chalk.green('✓')} copied: ${chalk.gray('dist/index.css')} to ${chalk.magentaBright('dist/index-vars.css')}`);
    }).catch(err => err && Promise.reject(err));
  });
};

yargs.scriptName("builder")
  // .welcome(boxen(chalk.blue('Component builder'), {padding: 1, margin: 1, borderStyle: 'round'}))
  .options({
    'directory': {
      alias: 'dir',
      describe: 'The directory to build',
      type: 'array',
      default: [ process.cwd() ],
      coerce: (dir) => {
        if (Array.isArray(dir)) return dir;
        if (typeof dir !== 'string') return [];

        if (isComponentDir(dir)) return [dir];
        if (isRootDir(dir)) {
          const components = fs.readdirSync(path.join(dir, 'components'));
          if (!components.length) {
            throw new Error('No components found in the specified directory.');
          }
          return components.map((component) => path.join(dir, 'components', component));
        }

        throw new Error('The directory specified is not a supported package.');
      }
    },
    'verbose': {
      alias: 'v',
      describe: 'Verbose output',
      type: 'boolean',
      default: true
    },
  })
  .usage("\nUsage: $0 <task> [directory] [options]")
  .command('clean [directory]', 'Clean the built assets', async (yargs) => {
    const { directory } = yargs.argv;
    return await Promise.all(directory.map(d => clean(d)))
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });
  })
  .command('build [directory] [options]', 'Build the component', async (yargs) => {
    yargs.options('clean', {
      alias: 'c',
      describe: 'Clean the built assets before building',
      type: 'boolean',
      default: false
    });
    const { directory, clean: c, verbose } = yargs.argv;
    if (c) {
      await Promise.all(directory.map(d => clean(d)))
        .catch((err) => {
          console.log(err);
          process.exit(1);
        });
    }
    return Promise.all(directory.map(d => build(d, verbose)))
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });
  })
  .command('dev', 'Build the component and watch for changes')
  .command('watch', 'Watch for changes and rebuild if needed')
  .epilogue(`Copyright ${new Date().getFullYear()} Adobe. All rights reserved.`)
  .help(true)
  .check((_argv, options) => {
    const { directory } = options;
    if (!isComponentDir(directory) && !isRootDir(directory)) {
      throw new Error('The directory specified is not a supported package.');
    }
    return true;
  })
  .argv;
