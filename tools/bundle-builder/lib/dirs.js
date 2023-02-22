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

const path = require('path');

exports.builder = path.resolve(__dirname, '..');
exports.site = path.dirname(require.resolve('@spectrum-css/documentation'));
exports.topLevel = path.resolve(__dirname, '../../..');
exports.isTopLevel = !!(process.cwd() === exports.topLevel);
exports.topLevelComponents = path.join(exports.topLevel, 'components');
exports.components = exports.isTopLevel ? exports.topLevelComponents : path.join(process.cwd(), 'node_modules/@spectrum-css');
