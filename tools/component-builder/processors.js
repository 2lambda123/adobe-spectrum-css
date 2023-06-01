/**!
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

function getProcessors({
	keepVars = false,
	notNested = true,
	secondNotNested = true,
	diff = false,
} = {}) {
	return [
		require("postcss-import"),
		require("postcss-remapvars"),
		require("postcss-nested"),
		require("postcss-inherit"),
		diff ? require("./plugins/postcss-varsonly")() : null,
		require("postcss-logical")(),
		require("./plugins/postcss-transform-logical")(),
		require("postcss-dir-pseudo-class")(),
		require("./plugins/postcss-custom-properties-passthrough")(),
		require("postcss-calc"),
		keepVars ? require("./plugins/postcss-custom-properties-mapping") : null,
		notNested
			? require("./plugins/postcss-notnested")({ replace: ".spectrum" })
			: null,
		require("postcss-svg"),
		require("legacy-postcss-dropunusedvars"),
		require("legacy-postcss-dropdupedvars"),
		require("postcss-droproot"),
		require("postcss-focus-ring"),
		secondNotNested ? require("./plugins/postcss-notnested")() : null, // Second one to catch all stray &
		require("postcss-discard-empty"),
		require("postcss-discard-comments")({ removeAllButFirst: true }),
		require("autoprefixer")({}),
	].filter(Boolean);
}

exports.getProcessors = getProcessors;
exports.processors = getProcessors({ keepVars: true });
exports.legacyProcessors = getProcessors();
