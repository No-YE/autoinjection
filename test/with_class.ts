import 'reflect-metadata'
import test from 'ava'
import { Service, Inject } from '../src'

test('Parameters with Indect decorators should have dependency injected', (t) => {
  @Service()
  class Foo { }

  @Service()
  class Bar {
    constructor(@Inject() public foo?: Foo) { }
  }

  t.not(new Bar().foo, undefined)
})

test('Parameters without Indect decorators should not have dependency injected', (t) => {
  @Service()
  class Foo { }

  @Service()
  class Bar {
    constructor(public foo?: Foo) { }
  }

  t.is(new Bar().foo, undefined)
})

test('A class that has Service with singleton option should be injected as singleton', (t) => {
  @Service({ singleton: true })
  class Foo {
    value = 0
  }

  @Service()
  class Bar {
    constructor(@Inject() public foo?: Foo) {
      foo!.value++
    }
  }

  t.is(new Bar().foo?.value, 1)
  t.is(new Bar().foo?.value, 2)
})
