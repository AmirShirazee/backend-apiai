export const generateImportStatement = (
  serviceImports: Set<string>
): string => {
  const imports = Array.from(serviceImports).join(",\n  ");
  return `import {${imports}} from './services';`;
};
