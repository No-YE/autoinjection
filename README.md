# autoinjection
Automatic Dependency Injection for TypeScript.

## Installation
Install autoject by npm.
```sh
npm install autoinjection
```

If you want to use autoinjection with interface, install `ttypescript` too.
```sh
npm install --save-dev ttypescript
```

Import `reflect-metadata` package.
```ts
import 'refect-metadata'
```

Set `experimentalDecorators` and `emitDecoratorMetadata` options to true in your `tsconfig.json`
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

To use autoinjection with interface, add `plugins` option also.
```json
{
  "plugins": [
    {
      "transform": "autoject/lib/transform",
    }
  ]
}
```

## Usage
with class
```ts
import { Service, Inject } from 'autoinjection'

@Service()
class Foo {
  print() {
    console.log('foo')
  }
}

@Service()
class Bar {
  constructor(@Inject() private foo?: Foo) { }

  print() {
    this.foo?.print()
  }
}

new Bar().print() // foo
```

with interface
```ts
import { Service, Inject } from 'autoinjection'

interface IFoo { }

@Service()
class Foo implements IFoo {
  print() {
    console.log('foo')
  }
}

@Service()
class Bar {
  constructor(@Inject() private foo?: IFoo) { }

  print() {
    this.foo?.print()
  }
}

new Bar().print() // foo
```
