/**
 * @todo: Importing commons assets such as extends brings along all their comments
 * which is not ideal. We should be able to strip them out or make the extends available
 * to all components without having to import them.
 */

const { existsSync } = require("fs");
const { sep, join, basename, dirname } = require("path");

const { hideBin } = require("yargs/helpers");
const yargs = require("yargs");

const fetchComponentMetadata = require("./tasks/fetch-metadata-from-css");

/**
 * @description This PostCSS config determines which file
 * to load based on env variable
 * @type import('postcss-load-config').ConfigFn
 */
module.exports = ({ cwd, env = "development", file, options = {} }) => {
  const {
    _: input,
    output,
    map = options.map ?? false,
  } = yargs(hideBin(process.argv)).argv;

  const inputDirname = typeof file === "string" ? dirname(file) : file.dirname ?? dirname(input[0]);
  const inputBasename = typeof file === "string" ? basename(file) : file.basename ?? basename(input[0]);

  let prefix = "spectrum";
  const parts = inputDirname.split(sep);

  // Prefer the foldername provided by the NX_TASK_TARGET_PROJECT env variable
  let foldername = process.env.NX_TASK_TARGET_PROJECT;
  if (!foldername || foldername === "storybook" || foldername === "site") {
    // If we didn't get a foldername from the env variable, try to get it from the file
    if (parts.includes("components")) {
      foldername = parts[parts.indexOf("components") + 1];
    }
  }

  // If we got a foldername from the interpretation above, use it to set the paths
  cwd = foldername ? join(__dirname, "components", foldername) : cwd ?? process.cwd();
  const from = inputDirname && inputBasename ? join(inputDirname, inputBasename) : join(cwd, "index.css");
  const to = output ?? join(cwd, "dist/index.css");

  let metadata = fetchComponentMetadata(from);
  if (!metadata && existsSync(join(cwd, "index.css"))) {
    metadata = fetchComponentMetadata(join(cwd, "index.css"));
  }

  if (metadata && Object.keys(metadata).length && metadata.namespace) {
    prefix = metadata.namespace;
  }

  // Determine if this is an express file
  const isExpress = Boolean(basename(from, ".css") === "express");
  const isTheme = isExpress || Boolean(basename(from, ".css") === prefix);

  let isLegacy = metadata?.legacy ?? false;
  /* If the status isn't listed in the component's metadata, check the package.json */
  if (metadata && typeof metadata.legacy === "undefined" && existsSync(join(cwd, "package.json"))) {
    const pkg = require(join(cwd, "package.json"));
    if (pkg.peerDependencies && pkg.peerDependencies["@spectrum-css/vars"]) {
      isLegacy = true;
    }
  }

  const isVarsOnly = isLegacy && Boolean(to && basename(to, ".css") === "vars");

  return {
    ...options,
    map,
    plugins: {
      /* --------------------------------------------------- */
      /* ------------------- IMPORTS ---------------- */

      /** @link https://github.com/postcss/postcss-import#postcss-import */
      "postcss-import": {
        root: cwd,
        addModulesDirectories: [join(cwd, "node_modules"), join(__dirname, "node_modules")],
      },

      /* --------------------------------------------------- */
      /* ------------------- SASS-LIKE UTILITIES ----------- */
      "postcss-nested": {},
      "postcss-inherit": {},

      /**
       * @link https://github.com/csstools/postcss-extend-rule
       * @note replacement for postcss-inherit
       */
      "postcss-extend-rule": {
        onRecursiveExtend: "throw",
        onUnusedExtend: "ignore",
      },

      /* --------------------------------------------------- */
      /* ------------------- ORGANIZE/DEDUPE --------------- */

      /* Converts transforms with a logical identifier to support ltr and rtl */
      "@spectrum-tools/postcss-transform-logical": {},

      /* --------------------------------------------------- */
      /* ------------------- VARIABLE PARSING -------------- */
      /**
       * @note only used in migrated builds
       * @todo could this be broken out into smaller, focused plugins?
       *
       * @example @\container style(--system: express) -> .spectrum--express
       * @link https://blog.logrocket.com/new-css-style-queries/
       * @link https://developer.chrome.com/blog/style-queries/
       *
       * @note keyIdentifier: helps the script know which class is the "root" or top-level class
       * @note selectors: (default=true) false is used for index-theme.css & themes/*.css
       * @note flatVariables: (default=false) true is used for index-base.css
       */
      "@spectrum-tools/postcss-container-style-converter": !isLegacy
        ? {
          prefix,
          keyIdentifier: metadata?.component,
          selectors: !(isTheme || (to && Boolean(basename(to, ".css") === "index-theme"))),
          flatVariables: !(to && Boolean(basename(to, ".css") === "index-base")),
        }
        : false,

      /**
       * @note this is only running on updated components in the themes/express.css file
       * or on the vars.css build
       */
      "@spectrum-tools/postcss-combine-selectors": (isTheme || isVarsOnly) ? isTheme
        ? {
          selector: isExpress ? `.${prefix}--express` : `.${prefix}`,
          customPropertiesOnly: isVarsOnly,
          ignoreList: [/^--highcontrast/, /^--mod/, /^--spectrum/],
        }
        : { customPropertiesOnly: true } : false,

      /* --------------------------------------------------- */
      /* ------------------- POLYFILLS --------------------- */
      /** @note [CSS-289] Coordinating with SWC */
      // "postcss-hover-media-feature": {},

      /**
       * @todo should we be documenting this for downstream users rather
       * than polyfilling the features ourselves? what if they want to
       * use a different support matrix?
       *
       * @note stage 2 (default); stage 4 === stable
       * @link https://github.com/csstools/postcss-plugins
       * @link https://preset-env.cssdb.org/features/#stage-2
       */
      "postcss-preset-env": {
        stage: 3,
        env,
        features: {
          "logical-properties-and-values": false,
          clamp: true,
          "color-functional-notation": true,
          "dir-pseudo-class": { preserve: true },
          "nesting-rules": { noIsPseudoSelector: true },
          // "focus-visible-pseudo-class": true,
          // https://github.com/jsxtools/focus-within
          "focus-within-pseudo-class": true,
          "font-format-keywords": true,
          "not-pseudo-class": true,
          "opacity-percentage": true,
          // https://github.com/csstools/postcss-plugins/tree/main/plugins/css-prefers-color-scheme
          "prefers-color-scheme-query": true,
        },
      },

      /* --------------------------------------------------- */
      /* ------------------- CLEAN-UP TASKS ---------------- */
      "postcss-discard-comments": {
        removeAllButFirst: true,
      },

      stylelint: {
        configFile: join(__dirname, "stylelint.config.js"),
        allowEmptyInput: true,
        cache: false,
        ignorePath: join(__dirname, ".stylelintignore"),
        reportNeedlessDisables: true,
        reportInvalidScopeDisables: true,
      },

      "postcss-reporter": {
        clearReportedMessages: true,
      },

      /** @note normalizeWhitespace performs a lightweight minification */
      cssnano: {
        preset: [
          "lite",
          {
            normalizeWhitespace: true,
            discardComments: true,
            orderedValues: true,
            mergeRules: true,
            uniqueSelectors: true,
            cssDeclarationSorter: true,
          },
        ],
      },
    },
  };
};
