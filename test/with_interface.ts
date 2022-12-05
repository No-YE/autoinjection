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

test('A class that has Service with singleton option should be injected as singleton', (t) => {
  interface IFoo {
    value: number
  }
  @Service({ singleton: true })
  class Foo implements IFoo {
    value = 0
  }

  @Service()
  class Bar {
    constructor(@Inject() public foo?: IFoo) {
      foo!.value++
    }
  }

  t.is(new Bar().foo?.value, 1)
  t.is(new Bar().foo?.value, 2)
  t.is(new Foo().value, 0)
})
