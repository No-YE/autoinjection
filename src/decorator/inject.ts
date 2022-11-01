import { type Class } from '../types'

export const injectParameterIndexMap: Map<Class, Set<number>> = new Map()

export const Inject = () => {
  return (target: Class, _propertyKey: string | symbol, parameterIndex: number) => {
    const injectParameterIndex  = injectParameterIndexMap.get(target) ?? new Set()
    injectParameterIndex.add(parameterIndex)

    injectParameterIndexMap.set(target, injectParameterIndex)
  }
}
