import * as ts from 'typescript'

export default function myTransformerPlugin(program: ts.Program, opts: unknown) {
  const checker = program.getTypeChecker()

  return {
    before(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        function visitor(node: ts.Node): ts.Node {

          // implements interface가 있는 class에는 'autoinjection:implementations'라는 metadata에 interface의 경로를 넣어준다.
          if (ts.isClassDeclaration(node) && node.heritageClauses) {
            const implementationsMetadata: Array<ts.StringLiteral> = []

            for (const clause of node.heritageClauses) {
              for (const typeArgument of clause.types) {
                const type = checker.getTypeAtLocation(typeArgument)

                if (!type.isClassOrInterface()) {
                  break
                }

                checker
                  .getBaseTypeOfLiteralType(type)
                  .getSymbol()
                  ?.getDeclarations()
                  ?.forEach((d) => {
                    const { line, character } = ts.getLineAndCharacterOfPosition(d.getSourceFile(), d.getStart())
                    implementationsMetadata.push(
                      ts.factory.createStringLiteral(`${d.getSourceFile().fileName}:${line + 1}:${character + 1}`)
                    )
                })
              }
            }

            const decorator = ts.factory.createDecorator(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('Reflect'),
                  ts.factory.createIdentifier('metadata'),
                ),
                undefined,
                [
                  ts.factory.createStringLiteral('autoinjection:implementations'),
                  ts.factory.createArrayLiteralExpression(
                    implementationsMetadata,
                    false
                  )
                ],
              ),
            )

            const decorators = (ts.getDecorators(node) ?? []).concat(decorator)
            return ts.factory.updateClassDeclaration(node, decorators, ts.getModifiers(node), node.name, node.typeParameters, node.heritageClauses, node.members)
          }

          // @Inject() decorator가 있으면서 타입이 interface인 constructor parameter에는 'autoinjection:interfaceParamtypes'라는 metadata에 interface의 경로를 넣어준다.
          if (ts.isClassDeclaration(node)) {
            for (const child of node.getChildren()) {
              if (child.kind !== ts.SyntaxKind.SyntaxList) {
                continue
              }

              for(const c of child.getChildren()) {
                if (!ts.isConstructorDeclaration(c)) {
                  continue
                }

                const interfaceTypeLiterals = c.parameters.map((parameter) => {
                  if (!parameter.type) {
                    return ts.factory.createIdentifier('undefined')
                  }
                
                  const injectDecorator = ts.getDecorators(parameter)?.find((decorator) => decorator.getText() === '@Inject()')
                  const childType = checker.getTypeAtLocation(parameter.type)

                  if (injectDecorator && childType.isClassOrInterface() && !childType.isClass()) {
                    const interfaceTypeLiterals = checker
                      .getBaseTypeOfLiteralType(childType)
                      .getSymbol()
                      ?.getDeclarations()
                      ?.map((d) => {
                        const { line, character } = ts.getLineAndCharacterOfPosition(d.getSourceFile(), d.getStart())
                        return ts.factory.createStringLiteral(`${d.getSourceFile().fileName}:${line + 1}:${character + 1}`)
                      })
                      ?.[0]

                    return interfaceTypeLiterals ?? ts.factory.createIdentifier('undefined')
                  }

                  return ts.factory.createIdentifier('undefined')
                })

                const decorator = ts.factory.createDecorator(
                  ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('Reflect'),
                      ts.factory.createIdentifier('metadata'),
                    ),
                    undefined,
                    [
                      ts.factory.createStringLiteral('autoinjection:interfaceParamtypes'),
                      ts.factory.createArrayLiteralExpression(interfaceTypeLiterals, false),
                    ],
                  ),
                )
                const decorators = (ts.getDecorators(node) ?? []).concat(decorator)

                return ts.factory.updateClassDeclaration(node, decorators, ts.getModifiers(node), node.name, node.typeParameters, node.heritageClauses, node.members)
              }
            }
          }

          return ts.visitEachChild(node, visitor, ctx)
        }

        return ts.visitEachChild(sourceFile, visitor, ctx)
      }
    }
  }
}
