const { createMacro } = require('babel-plugin-macros');

function assertMacro({ references, state, babel }) {
  const { default: defaultImport = [] } = references;
  const t = babel.types;

  defaultImport.forEach(referencePath => {
    if (referencePath.parentPath.type !== 'CallExpression') {
      throw new MacroError('assert.macro is a function(condition, message)');
    }

    const args = referencePath.parentPath.get('arguments');

    //referencePath.parentPath.replaceWithMultiple([]);
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
}

const assert = createMacro(assertMacro);

module.exports = assert;