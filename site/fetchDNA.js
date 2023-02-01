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

// const statusLightVariants = {
//   'Deprecated': 'negative',

//   'Beta Contribution': 'notice',

//   'Contribution': 'notice',
//   'Unverified': 'notice',

//   'Canon': 'positive',
//   'Verified': 'positive'
// };

// exports.getStatusLightVariant = function(status) {
//   return statusLightVariants[status] || 'neutral';
// };

const dnaVars = require('@spectrum-css/vars/dist/spectrum-metadata.json');

module.exports = (component) => {
  if (!dnaVars) return;
  // Get DNA information
  const dnaComponentId = component.id || component.name.toLowerCase();

  if (!component.status) component.status = 'Contribution';
  const cssStatus = component.status === 'Contribution' ? 'Unverified' : component.status;

  const sourceStatus = dnaVars['spectrum-' + dnaComponentId + '-status'] || component.dnaStatus;
  /* Get DNA status for documentation */
  let dnaStatus;
  if (cssStatus === 'Deprecated') dnaStatus = 'Deprecated';
  if (cssStatus === 'Verified' && (!sourceStatus || sourceStatus !== 'Released')) {
    console.log(`${dnaComponentId} is ${cssStatus} in CSS, but ${dnaStatus} in DNA`);
  }

  if (!dnaStatus) {
    console.log(`${dnaComponentId} has no DNA status`);
    dnaStatus = 'Contribution';
  }

  // Store the info
  // Get info based on component variation first, then component name second
  if (!component.name) component.name = dnaVars['spectrum-' + dnaComponentId + '-name'];
  component.cssStatus = cssStatus;
  component.dnaStatus = dnaStatus;

  // Add other data
  component.id = dnaComponentId;

  for (id in component.examples) {
    let example = component.examples[id];
    if (typeof example === 'string') {
      // Handle markup only examples
      example = {
        id: id,
        markup: example
      };
      component.examples[id] = example;
    } else if (!example.id) example.id = id;

    // All examples are verified if the outer component is verified
    if (component.status === 'Verified' && !example.status) example.status = 'Verified';

    // The example is canon if the component is Canon and Verified
    if (component.dnaStatus === 'Canon' && component.status === 'Verified') example.dnaStatus = 'Canon';

    // this.populateDNAInfo(example);
  }

  return component;
};
