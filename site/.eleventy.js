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

const path = require('path');

// const prism = require('prismjs');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const loadicons = require.resolve('loadicons');
const workflowIcons = require.resolve('@adobe/spectrum-css-workflow-icons/dist/spectrum-icons.svg');
const uiIcons = require.resolve('@spectrum-css/icon/dist/spectrum-css-icons.svg');
const focusPolyfill = require.resolve('@adobe/focus-ring-polyfill');
const lunr = require.resolve('lunr');
const prism = path.dirname(require.resolve('prismjs'));

const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

const markdownIt = require('markdown-it');
const markdownItAnchors = require('markdown-it-anchor');


const fetchComponentData = require('./_data/components.js');

const hostSettings = {
  notify: true,
  open: true,
  minify: true,
  startPath: 'docs/index.html',
};

if (process.env.BROWSERSYNC_PORT) {
  hostSettings.port = process.env.BROWSERSYNC_PORT;
}

/**
 * @type import('@11ty/eleventy').EleventyConfig
*/
module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight, {
    init: function ({ Prism }) {
      Prism.languages['html-live'] = Prism.languages.html;
      Prism.languages['html-no-demo'] = Prism.languages.html;
    },
  });

  eleventyConfig.addNunjucksGlobal('WATCH_MODE', process.env.WATCH_MODE);
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setBrowserSyncConfig(hostSettings);

  eleventyConfig.addPassthroughCopy({
    'resources/favicon.png': 'docs/favicon.png',
    'resources/css': 'docs/css',
    'resources/img': 'docs/img',
    'resources/js': 'docs/js',
    [workflowIcons]: 'docs/img/spectrum-icons.svg',
    [uiIcons]: 'docs/img/spectrum-css-icons.svg',
    [loadicons]: 'docs/js/loadicons/index.js',
    [focusPolyfill]: 'docs/js/focus-ring-polyfill/index.js',
    [lunr]: 'docs/js/lunr/lunr.js',
    [`${prism}/themes/{prism-dark,prism}.min.css`]: 'docs/css/prism/',
  });


  eleventyConfig.setLibrary(
    'md',
    markdownIt({ html: true }).use(markdownItAnchors, {
      level: [2, 3, 4],
      permalink: true,
      permalinkSymbol: '#',
      permalinkAttrs: () => ({ 'aria-label': '§' }),
      renderPermalink: (slug, opts, state, idx) => {
        const space = () =>
          Object.assign(new state.Token('html_block', '', 0), {
            content: '&nbsp;',
          })

        const linkTokens = [
          Object.assign(new state.Token('link_open', 'sp-link', 1), {
            attrs: [
              ['class', opts.permalinkClass],
              ['href', opts.permalinkHref(slug, state)],
              ...Object.entries(opts.permalinkAttrs(slug, state)),
            ],
          }),
          Object.assign(new state.Token('html_block', '', 0), {
            content: opts.permalinkSymbol,
          }),
          new state.Token('link_close', 'sp-link', -1),
        ]

        const position = {
          false: 'push',
          true: 'unshift',
        }
        // `push` or `unshift` according to position option.
        // Space is at the opposite side.
        if (opts.permalinkSpace) {
          linkTokens[position[!opts.permalinkBefore]](space())
        }
        // `push` or `unshift` according to position option.
        // Link tokens are at the opposite side.
        state.tokens[idx + 1].children[position[opts.permalinkBefore]](
          ...linkTokens
        )
      },
    })
  );

  eleventyConfig.addFilter('markdownify', (value) => {
    const md = markdownIt({
      html: true,
      linkify: false,
      typographer: true,
      breaks: true
    });

    const defaultRenderer = (tokens, idx, options, env, self) =>
      self.renderToken(tokens, idx, options, env, self);

    for (let [rule, className] of Object.entries({
      'link_open': 'spectrum-Link',
      'table_open': 'spectrum-Table spectrum-Table--sizeM',
      'thead_open': 'spectrum-Table-head',
      'tr_open': 'spectrum-Table-row',
      'tbody_open': 'spectrum-Table-body',
      'th_open': 'spectrum-Table-headCell',
      'td_open': 'spectrum-Table-cell',
      'code_inline': 'spectrum-Code spectrum-Code--sizeS',
      'code_block': 'spectrum-Code spectrum-Code--sizeS'
    })) {
      md.renderer.rules[rule] = (function(className) {
        const oldRule = md.renderer.rules[rule] || defaultRenderer;
        return function (tokens, idx, options, env, self) {
          tokens[idx].attrPush(['class', className]);
          return oldRule(tokens, idx, options, env, self);
        };
      })(className);
    }

    const code_inline = md.renderer.rules.code_inline || defaultRenderer;
    md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      // ~ indicates markup that should be red
      if (token.content.substr(0, 1) === '~' && token.content.substr(-1) === '~') {
        let aIndex = tokens[idx].attrIndex('class');

        let className = 'spectrum-CSSExample-oldAPI';
        if (aIndex < 0) {
          // add class
          tokens[idx].attrPush(['class', className]);
        }
        else {
          // append class
          tokens[idx].attrs[aIndex][1] = `${tokens[idx].attrs[aIndex][1]} ${className}`;
        }

        token.content = token.content.slice(1, -1);
      }
      return code_inline(tokens, idx, options, env, self);
    };

    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const headingMap = {
        'h1': 'spectrum-Heading spectrum-Heading--sizeL',
        'h2': 'spectrum-Heading spectrum-Heading--sizeM',
        'h3': 'spectrum-Heading spectrum-Heading--sizeS',
        'h4': 'spectrum-Heading spectrum-Heading--sizeXS',
        'h5': 'spectrum-Heading spectrum-Heading--sizeXXS'
      };

      let headingClass = headingMap[tokens[idx].tag];
      if (headingClass) tokens[idx].attrPush(['class', headingClass]);
      return defaultRenderer(tokens, idx, options, env, self);
    };
    return md.render(value);
  });


  fetchComponentData().then((components) => {
    components.forEach((c) => {
      if (!c.path || !c.name) return;

      const fetch = require.resolve(c.packageName);
      console.log(fetch);

      const obj = {};
      obj[`${path.join(c.path, 'dist/**')}`] = `packages/${c.name}`;
      obj[`${path.join(c.path, 'package.json')}`] = `packages/${c.name}`;

      eleventyConfig.addPassthroughCopy(obj);
    });
  });

  return {
    dir: {
      input: 'content',
      output: '../dist',
      includes: '../_partials',
      layouts: '../_includes',
      data: '../_data',
    },
    passthroughFileCopy: true,
    templateFormats: ['njk', 'md', 'css', 'yml'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
  }
}
