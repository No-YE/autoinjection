import { type Class } from '../types'

export const injectedParameterIndexesMap: Map<Class, Set<number>> = new Map()

export const Inject = () => {
  return (target: Class, _propertyKey: string | symbol, parameterIndex: number) => {
    const injectedParameterIndexes  = injectedParameterIndexesMap.get(target) ?? new Set()
    injectedParameterIndexes.add(parameterIndex)

    injectedParameterIndexesMap.set(target, injectedParameterIndexes)
  }
}
