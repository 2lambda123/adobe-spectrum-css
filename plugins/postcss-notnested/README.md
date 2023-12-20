# postcss-notnested

> Removes nested rules from CSS when they are left hanging without a parent selector.

## Installation

```sh
yarn add -DW postcss-notnested
```

## Usage

```sh
postcss -u postcss-notnested -o dist/index.css src/index.css
```

## Options

### `replace`

Type: `String`<br> Default: `none` <br> Example: `'body'` <br> Description: The selector to replace the nested rules with. This is useful for when you want to scope the CSS to a particular selector.
