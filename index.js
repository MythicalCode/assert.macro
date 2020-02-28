const { createMacro, MacroError } = require('babel-plugin-macros');

module.exports = createMacro(debugMacro);

function debugMacro({ references, state, babel }) {
  const { assert = [], expose = [], default: defaultImport = [] } = references;
  const t = babel.types;

  assert.forEach(function asserMacro(referencePath) {
    if (process.env.NODE_ENV === 'development') {
      referencePath.parentPath.replaceWithMultiple([]);
      return;
    }

    if (referencePath.parentPath.type !== 'CallExpression') {
      throw new MacroError('assert.macro is a function(condition, message)');
    }

    if (defaultImport.length) {
      throw new MacroError('debug.macro has no default export');
    }

    const args = referencePath.parentPath.get('arguments');

    referencePath.parentPath.replaceWithMultiple([
      t.ifStatement(
        t.unaryExpression('!', args[0].node),
        t.blockStatement([
          t.throwStatement(
            t.newExpression(t.identifier('Error'), [
              t.binaryExpression('+', t.stringLiteral('[Assert Failed]: '), args[1].node)
            ])
          )
        ])
      )
    ]);
  });

  // expose.forEach(function exposeMacro(referencePath) {
  //   if (process.env.NODE_ENV === 'development') {
  //     return;
  //   }
  //
  //   if (referencePath.parentPath.type !== 'CallExpression') {
  //     throw new MacroError('expose.macro is a function(condition, message)');
  //   }
  //
  //   const args = referencePath.parentPath.get('arguments');
  //
  //   referencePath.parentPath.replaceWithMultiple([
  //     t.ifStatement(
  //       t.unaryExpression('!', args[0].node),
  //       t.blockStatement([
  //         t.throwStatement(
  //           t.newExpression(t.identifier('Error'), [
  //             t.binaryExpression('+', t.stringLiteral('[Expose Failed]: '), args[1].node)
  //           ])
  //         )
  //       ])
  //     )
  //   ]);
  // });

  return {
    keepImports: false
  };
}
