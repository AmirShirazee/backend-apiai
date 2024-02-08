export const findMatchingMethod = (
  operationId: string | undefined,
  methodNames: string[],
): string => {
  const normalizeName = (name: string | undefined): string => {
    if (!name) {
      return '';
    }
    // replace dashes with underscores and camel case the result
    const replaced = name.replace(/-/g, '_');
    return replaced
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace(/_[a-z]/g, (match) => match.toUpperCase().replace('_', ''));
  };

  const normalizedOperationId = normalizeName(operationId);
  const matchingMethodNames = methodNames.filter(
    (methodName) => normalizeName(methodName) === normalizedOperationId,
  );

  if (matchingMethodNames.length > 1) {
    throw new Error(
      `Found multiple matches for operationId ${operationId}: ${matchingMethodNames.join(', ')}`,
    );
  }

  let matchingMethodName: string | undefined;
  if (matchingMethodNames.length === 1) {
    matchingMethodName = matchingMethodNames[0];
  } else {
    matchingMethodName = methodNames.find(
      (methodName) => normalizeName(methodName) === normalizeName(operationId),
    );

    if (!matchingMethodName) {
      throw new Error(`No match found for operationId ${operationId}`);
    }
  }

  return matchingMethodName;
};
