import { type Class } from '../types'
import { injectParameterIndexMap } from './inject'

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
    serviceClassInfos.push({
      klass: target,
      singleton: Boolean(options?.singleton),
      implementations: Reflect.getMetadata('autoinjection:implementations', target),
    })

    const originParamTypes: Array<Class | undefined> = Reflect.getOwnMetadata('design:paramtypes', target) ?? []
    const interfaceParamtypes: Array<string | undefined> = Reflect.getMetadata('autoinjection:interfaceParamtypes', target) ?? []
    const paramTypes = originParamTypes.map((originParamType, index) => interfaceParamtypes[index] ?? originParamType)

    const injectParameterIndex = injectParameterIndexMap.get(target) ?? new Set()

    return class extends target {
      constructor(...args: any[]) {
        const injectedArgs = paramTypes.map((paramType, index) => {
          if (args.length > index) {
            return args[index]
          }

          if (!paramType|| !injectParameterIndex.has(index)) {
            return args[index]
          }

          const classInfo = isInterfaceParamTypes(paramType)
            ? serviceClassInfos.find((info) => info.implementations?.includes(paramType))
            : serviceClassInfos.find((info) => info.klass === paramType || paramType.prototype instanceof info.klass)

          if (!classInfo) {
            return args[index]
          }

          return classInfo.singleton ? getSingletonInstance(classInfo.klass) : new classInfo.klass()
        })        

        super(...injectedArgs)
      }
    }
  }
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
