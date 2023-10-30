module.exports = {
    root: true,
    env: {
        node: true,
        es2020: true,
        browser: true,
    },
    plugins: ["@nx"],
    extends: ["eslint:recommended", "plugin:@nx/javascript", "plugin:prettier/recommended"],
    parserOptions: {
        sourceType: "module",
    },
    rules: {
        "brace-style": ["error", "1tbs", { allowSingleLine: true }],
        "func-call-spacing": ["error", "never"],
        "linebreak-style": ["error", "unix"],
        "no-console": ["error", { allow: ["warn", "error"] }],
        semi: ["error", "always"],
        "space-before-blocks": ["error", "always"],
        "@nx/enforce-module-boundaries": ["warn"],
        "prettier/prettier": [
            "warn",
            {
                singleQuote: false,
            },
        ],
    },
    overrides: [
        {
            files: ["*.json"],
            parser: "jsonc-eslint-parser",
            extends: ["plugin:jsonc/recommended-with-jsonc", "plugin:jsonc/prettier"],
            rules: {
                "jsonc/sort-keys": [
                    "warn",
                    {
                        pathPattern: ".*", // Hits the all properties
                        hasProperties: ["type"],
                        order: [
                            "type",
                            "properties",
                            "items",
                            "required",
                            "minItems",
                            "additionalProperties",
                            "additionalItems",
                        ],
                    },
                    {
                        pathPattern: ".*",
                        order: { type: "asc" },
                    },
                ],
            },
        },
        {
            files: ["project.json"],
            rules: {
                "jsonc/sort-keys": [
                    "warn",
                    {
                        pathPattern: "^$",
                        order: ["$schema", "name", "tags", "implicitDependencies", "targets"],
                    },
                    {
                        pathPattern: ".*",
                        order: { type: "asc" },
                    },
                ],
            },
        },
        {
            files: ["package.json"],
            rules: {
                "@nx/dependency-checks": [
                    "error",
                    {
                        checkObsoleteDependencies: false,
                    },
                ],
                "jsonc/sort-keys": [
                    "warn",
                    {
                        pathPattern: "^$",
                        order: [
                            "$schema",
                            "private",
                            "name",
                            "version",
                            "description",
                            "license",
                            "author",
                            "maintainers",
                            "contributors",
                            "homepage",
                            "repository",
                            "bugs",
                            "type",
                            "exports",
                            "main",
                            "module",
                            "browser",
                            "man",
                            "preferGlobal",
                            "bin",
                            "files",
                            "directories",
                            "scripts",
                            "config",
                            "sideEffects",
                            "types",
                            "typings",
                            "workspaces",
                            "resolutions",
                            "dependencies",
                            "bundleDependencies",
                            "bundledDependencies",
                            "peerDependencies",
                            "peerDependenciesMeta",
                            "optionalDependencies",
                            "devDependencies",
                            "keywords",
                            "engines",
                            "engineStrict",
                            "os",
                            "cpu",
                            "publishConfig",
                        ],
                    },
                    {
                        pathPattern: "^repository$",
                        order: ["type", "url", "directory"],
                    },
                    {
                        pathPattern: ".*",
                        order: { type: "asc" },
                    },
                ],
            },
        },
        {
            files: ["components/*/stories/*.js", "storybook/*.js"],
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    impliedStrict: true,
                },
            },
        },
        {
            files: ["components/*/stories/*template.js"],
            rules: {
                "@nx/enforce-module-boundaries": 0,
            },
        },
    ],
};
