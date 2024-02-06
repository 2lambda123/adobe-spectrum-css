/*!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { dirname } = require("path");

const varDir = dirname(
	require.resolve("@spectrum-css/vars/package.json", {
		paths: [process.cwd(), __dirname],
	})
);

module.exports = ({
	cwd = process.cwd(),
	verbose = true,
	splitinatorOptions = {},
	keepVars = false,
	additionalPlugins = [],
	...options
} = {}) => {
	return {
		...options,
		plugins: [
			require("postcss-import"),
			require("postcss-extend"),
			require("postcss-nested"),
			require("postcss-dir-pseudo-class")(),
			require("postcss-hover-media-feature"),
			require("postcss-calc"),
			require("postcss-svg"),
			require("legacy-postcss-dropunusedvars"),
			require("legacy-postcss-dropdupedvars"),
			require("postcss-droproot"),
			require("postcss-discard-empty"),
			require("at-rule-packer"),
			require("postcss-discard-comments")({ removeAllButFirst: true }),
			require("autoprefixer")({}),
			require("postcss-reporter")({
				clearReportedMessages: true,
			}),
		],
	};
};
