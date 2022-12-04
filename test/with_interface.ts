import 'reflect-metadata'
import test from 'ava'
import { Service, Inject } from '../src'

test('Parameters with Indect decorators should have dependency injected', (t) => {
  interface IFoo { }
  
  @Service()
  class Foo implements IFoo { }
  
  @Service()
  class Bar {
    constructor(@Inject() public foo?: IFoo) {}
  }

  t.not(new Bar().foo, undefined)
})

test('Parameters without Indect decorators should not have dependency injected', (t) => {
  interface IFoo { }
  
  @Service()
  class Foo implements IFoo { }
  
  @Service()
  class Bar {
    constructor(public foo?: IFoo) {}
  }

  t.is(new Bar().foo, undefined)
})
