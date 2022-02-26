# Arabic word stemmer

This is `0` dependency, simple word stemmer for arabic languages, inspired
by [arabic-stemmer](https://www.npmjs.com/package/arabic-stemmer). This package supports `commonJs` as well as `ES`
modules.

## Installation

First install the package with npm

```shell
npm install arabic-stem
```

## Usage

```javascript
import Stemmer from 'arabic-stem'

const stemmer = new Stemmer();

console.log(stemmer.stem('المستنقعات'));
console.log(stemmer.stem('مستنقع'));

/*
    output:
    { stem: [ 'نقع' ], normalized: 'مستنقع' }
    { stem: [ 'نقع' ], normalized: 'مستنقع' }
    (both share a common stem ('نقع'))
*/

console.log(stemmer.stem('المستشفيات'));

/*
    output:
    { stem: [ 'شفي', 'سشف' ], normalized: 'مستشف' }
    { stem: [ 'شفي' ], normalized: 'شفا' }
    (both share a common stem ('شفي'))
*/

console.log(stemmer.stem('الأولاد'));
console.log(stemmer.stem('المولودين'));
/*
    output: 
    { stem: [ 'ولد' ], normalized: 'اولاد' }
    { stem: [ 'ولد', 'ملد' ], normalized: 'مولود' }
    (both share a common stem 'ولد')
*/
```

## Contribution

commit message format

```text
type(scope?): subject
```

scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")

### Commit Types

`build` `chore` `ci` `docs` `feat` `fix` `perf` `refactor`
`revert` `style` `test`
