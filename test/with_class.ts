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
