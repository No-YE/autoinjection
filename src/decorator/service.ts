import { type Class } from '../types'
import { injectedParameterIndexesMap } from './inject'

const serviceClassInfos: Array<ClassInfo> = []
const singletonInstanceMap = new Map<Class, object>()

type Options = {
  singleton?: boolean,
}

type ClassInfo = {
  klass: Class,
  singleton: boolean
  implementations?: Array<string>,
}

export const Service = (options?: Options) => {
  return <T extends Class>(target: T) => {
    const paramTypes = getParamTypes(target)
    const injectParameterIndexes = injectedParameterIndexesMap.get(target) ?? new Set()

    class NewClass extends target {
      constructor(...args: any[]) {
        const injectedArgs = paramTypes.map((paramType, index) => {
          const originArg = args[index]

          if (args.length > index) {
            return originArg
          }
          if (!paramType || !injectParameterIndexes.has(index)) {
            return originArg
          }

          const classInfo = isInterfaceParamTypes(paramType)
            ? serviceClassInfos.find((info) => info.implementations?.includes(paramType))
            : serviceClassInfos.find((info) => info.klass === paramType || paramType.prototype instanceof info.klass)

          if (!classInfo) {
            return originArg
          }

          return classInfo.singleton ? getSingletonInstance(classInfo.klass) : new classInfo.klass()
        })        

        super(...injectedArgs)
      }
    }

    serviceClassInfos.push({
      klass: NewClass,
      singleton: Boolean(options?.singleton),
      implementations: Reflect.getMetadata('autoinjection:implementations', target),
    })

    return NewClass
  }
}

function getParamTypes(target: Class) {
  const originParamTypes: Array<Class | undefined> = Reflect.getOwnMetadata('design:paramtypes', target) ?? []
  const interfaceParamtypes: Array<string | undefined> = Reflect.getMetadata('autoinjection:interfaceParamtypes', target) ?? []

  return originParamTypes.map((originParamType, index) => interfaceParamtypes[index] ?? originParamType)
}

function isInterfaceParamTypes(value: any): value is string {
  return typeof value === 'string'
}

function getSingletonInstance(klass: Class) {
  const singletonInstance = singletonInstanceMap.get(klass) 

  if (singletonInstance) {
    return singletonInstance
  }

  const instance = new klass()
  singletonInstanceMap.set(klass, instance)
  return instance
}
