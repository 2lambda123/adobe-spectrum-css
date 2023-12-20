# postcss-custom-properties-mapping

> Replaces custom properties with the token value from a mapping object.

## Installation

```sh
yarn add -DW postcss-custom-properties-mapping
```

## Usage

```sh
postcss -u postcss-custom-properties-mapping -o dist/index.css src/index.css
```

## Options

### `staticVars`

Type: `Map<string, string[]>`<br> Default: `new Map()` <br> Example: `[ ['--color-red', ['#f00'] ]` <br> Description: A map of static variables to substitute in the CSS (e.g. `var(--color-red)` will be replaced with `#f00`). These are the most likely to be used for things like colors, font sizes, etc. and consistitute a shorter list of variables that are most likely to be used in the CSS.

### `allVars`

Type: `Map<string, string[]>`<br> Default: `new Map()` <br> Example: `[ ['--color-red', ['#f00'] ]` <br> Description: A map of all possible variables to substitute in the CSS (e.g. `var(--color-red)` will be replaced with `#f00`). This is a comprehensive list of all possible variables that could be used in the CSS and is used to ensure that all variables are substituted.
