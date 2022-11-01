import 'reflect-metadata'
import { type Class } from '../types'
import { injectParameterIndexMap } from './inject'

const serviceClassInfos: Array<ClassInfo> = []

type ClassInfo = {
  klass: Class,
  implementations?: Array<string>,
}

export const Service = () => {
  return <T extends Class>(target: T) => {
    serviceClassInfos.push({ klass: target, implementations: Reflect.getMetadata('autoinjection:implementations', target) })

    const originParamTypes: Array<Class | undefined> = Reflect.getOwnMetadata('design:paramtypes', target) ?? []
    const interfaceParamtypes: Array<string | undefined> = Reflect.getMetadata('autoinjection:interfaceParamtypes', target) ?? []
    const paramTypes = originParamTypes.map((originParamType, index) => interfaceParamtypes[index] ?? originParamType)

    const injectParameterIndex = injectParameterIndexMap.get(target) ?? new Set()

    return class extends target {
      constructor(...args: any[]) {
        const injectedArgs = paramTypes.map((paramType, index) => {
          if (!paramType|| !injectParameterIndex.has(index)) {
            return args[index]
          }

          const classInfo = isInterfaceParamTypes(paramType)
            ? serviceClassInfos.find((info) => info.implementations?.includes(paramType))
            : serviceClassInfos.find((info) => info.klass === paramType || paramType.prototype instanceof info.klass)

          return classInfo ? new classInfo.klass() : args[index]
        })        

        super(...injectedArgs)
      }
    }
  }
}

function isInterfaceParamTypes(value: any): value is string {
  return typeof value === 'string'
}
