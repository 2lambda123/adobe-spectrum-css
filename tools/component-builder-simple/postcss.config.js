/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const {
    typographyTShirtSizes,
    typography,
    typographyTShirtMargins,
    typographyMargins,
    typographyTShirtColor,
    typographyColor,
} = require('./css/mixins.js');

// keepVars = false, notNested = true, secondNotNested = true, diff = false
module.exports = (options) => {
    const {
        env,
        map,
        isMigrated,
        keepUnusedVars = false,
        splitinatorOptions = {},
        additionalPlugins = [],
        ...settings
    } = options;
    return {
        ...settings,
        map: env === 'development' ? map : false,
        plugins: [
            require('postcss-import'),
            !isMigrated ? require('postcss-mixins')({
              mixins: {
                typographyTShirtSizes,
                typography,
                typographyTShirtMargins,
                typographyMargins,
                typographyTShirtColor,
                typographyColor,
              }
            }) : null,
            !isMigrated ? require('postcss-remapvars') : null,
            require('postcss-nested'),
            ...isMigrated ? [
                require('postcss-splitinator')({
                    processIdentifier: (identifier) => {
                        if (identifier === 'express') return 'spectrum--express';
                        return identifier;
                    },
                    ...splitinatorOptions
                }),
             ] : [],
            require('postcss-inherit'),
            ...!isMigrated ? [
                // was: postcss-varsonly
                diff ? (root, _result) => {
                    // Delete all comments
                    root.walkComments((comment) => {
                      comment.remove();
                    });

                    // Process each rule
                    root.walkRules((rule, ruleIndex) => {
                      // Don't break variable declarations
                      if (rule.selector === ':root') return;

                      // Check every declaration
                      rule.walkDecls((decl) => {
                        // Remove if not variable
                        if (!decl.value.match('var\(.*?\)')) {
                          decl.remove();
                        }
                      });

                      // Delete the rule if it's empty
                      if (rule.nodes.length === 0) rule.remove();
                    });
                } : null,
                require('postcss-logical')(),
            ] : [],
            require('postcss-transform-logical')(),
            !isMigrated ? require('postcss-dir-pseudo-class')() : null,
            // was: postcss-custom-properties-passthrough
            isMigrated ? (root, _result) => {
                root.walkRules((rule, _ruleIndex) => {
                  rule.walkDecls((decl) => {
                    if (decl.value.match('xvar\(.*?\)')) {
                      decl.value = decl.value.substr(1);
                    }
                    if (decl.prop.substr(0,3) === 'x--') {
                      decl.prop = decl.prop.substr(1);
                    }
                  });
                });
            } : null,
            require('postcss-calc'),
            !isMigrated ? [
                // was: postcss-custom-properties-mapping
                keepVars ? require('./plugins/postcss-custom-properties-mapping') : null,
                // was: postcss-notnested
                notNested ? (root, _result) => {
                    const replace = '.spectrum';
                    root.walkRules((rule) => {
                        if (!rule.selectors) return;

                        let replaced = false;
                        let selectors = rule.selectors.map(selector => {
                          if (/^&/.test(selector)) {
                            replaced = true;

                            // Handle special case where the replacement selector === the existing selector
                            if (selector.replace(/^&/, '') === replace) {
                              return replace;
                            }

                            return selector.replace(/^&/, replace);
                          } else return selector;
                        });

                        if (replaced) {
                          // De-dupe selectors
                          selectors = selectors.filter((selector, index) => {
                            return selectors.indexOf(selector) === index;
                          });

                          rule.selectors = selectors;
                        }
                    });
                } : null,
                require('postcss-svg'),
                require('postcss-functions')({
                functions: {
                    noscale: function (value) {
                    return value.toString().toUpperCase();
                    },
                    percent: function (value) {
                    return parseInt(value, 10) / 100;
                    }
                }
                }),
            ] : [],
            // was: postcss-strip-comments
            isMigrated ? (root, _result) => {
                root.walk(node => {
                    if (node.type === 'comment') {
                        // Get a reference to the parent before the node is removed
                        let parent = node.parent;
                        node.remove();

                        // If the comment was the last thing left in its parent, remove the parent
                        if (parent && parent.nodes && parent.nodes.length === 0) parent.remove();

                        return;
                    }
                });
            } : null,
            !keepUnusedVars && require('postcss-dropunusedvars'),
            require('postcss-dropdupedvars'),
            !isMigrated ? require('postcss-droproot') : null,
            require('postcss-focus-ring'),
            // was: postcss-notnested
            !isMigrated && secondNotNested ?
                (root, _result) => {
                    root.walkRules((rule) => {
                        if (!rule.selectors) return;

                        // Kill the selector with the stray ampersand -- it's not nested!
                        const selectors = rule.selectors.filter(selector => !/^&/.test(selector));

                        // If no selectors remain, remove the rule completely
                        if (selectors.length == 0) rule.remove();
                        // Only replace the selectors if we changed something (avoids extra work for every selector)
                        else if (selectors.length != rule.selectors.length) rule.selectors = selectors;
                    });
                } : null, // Second one to catch all stray &
            require('postcss-discard-empty'),
            require('autoprefixer')({
                'browsers': [
                'last 2 Edge versions',
                'last 2 Chrome versions',
                'last 2 Firefox versions',
                'last 2 Safari versions',
                'last 2 iOS versions'
                ]
            }),
            ...additionalPlugins,
        ]
    };
};
