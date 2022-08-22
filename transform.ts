import { API, FileInfo } from 'jscodeshift';

export default (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // DEAL WITH THE ENZYME IMPORT

  const enzymeImportDeclaration = root.find(j.ImportDeclaration, { source: { value: 'enzyme' } });
  const shallowCallExpressions = root.find(j.CallExpression, { callee: { name: 'shallow' } });

  // If `shallow` is only called for the axe test, we can remove the `shallow` import
  if (shallowCallExpressions.length === 1) {
    const numberOfImportsFromEnzyme = enzymeImportDeclaration.get().value.specifiers.length;
    // Only `shallow` is imported, so we can get rid of the whole enzyme import
    if (numberOfImportsFromEnzyme === 1) {
      enzymeImportDeclaration.remove();
    } else {
      // Something else is imported, e.g. `mount`, so we remove only the `shallow` import specifier
      const shallowImportSpecifier = root.find(j.ImportSpecifier, {
        imported: { name: 'shallow' },
      });
      shallowImportSpecifier.remove();
    }
  }

  // DEAL WITH THE REACT-TESTING-LIBRARY IMPORT
  const rtlImport = root.find(j.ImportDeclaration, { source: { value: '@testing-library/react' } });
  const renderImport = rtlImport.find(j.ImportSpecifier, { imported: { name: 'render' } });

  // If `render` has not been imported, we need to add it
  if (renderImport.length === 0) {
    const renderImportSpecifier = j.importSpecifier(j.identifier('render'));
    const rtlSource = j.stringLiteral('@testing-library/react');

    // If `react-testing-library` is not imported at all we add the whole declaration
    if (rtlImport.length === 0) {
      const rtlImportDeclaration = j.importDeclaration([renderImportSpecifier], rtlSource);
      root.get().node.program.body.unshift(rtlImportDeclaration);
    } else {
      // If we already have an import from `@testing-library/react`
      // we can just add `render` to the existing rtl import
      // (this would be unusual but it's a conceivable edge case)
      const existingImportSpecifiers = rtlImport.get().value.specifiers;
      rtlImport.replaceWith(
        j.importDeclaration([...existingImportSpecifiers, renderImportSpecifier], rtlSource)
      );
    }
  }

  // DEAL WITH THE VARIABLE ASSIGNMENT AND SHALLOW CALL

  // `component = shallow(<ComponentName />).html()`
  // (Not the `const`, which is part of the declaration, not the declarator)
  const variableDeclarator = root.find(j.VariableDeclarator, {
    id: { name: 'component' },
    init: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { callee: { name: 'shallow' } },
        property: { name: 'html' },
      },
    },
  });

  // Get whatever is in the JSX passed as the argument to `shallow`
  const componentName = variableDeclarator.find(j.JSXIdentifier).get().value.name;

  // Replace the declarator with `{ container } = render(<ComponentName />)
  variableDeclarator.replaceWith(
    j.variableDeclarator(
      j.identifier('{ container }'),
      j.callExpression(j.identifier('render'), [
        j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier(componentName), undefined, true)),
      ])
    )
  );

  // UPDATE AXE CALL ARGUMENT TO `container`

  // `expect(await axe(component)).toHaveNoViolations();`
  const axeCall = root.find(j.CallExpression, { callee: { name: 'axe' } });

  axeCall.replaceWith(j.callExpression(j.identifier('axe'), [j.identifier('container')]));

  return root.toSource();
};
