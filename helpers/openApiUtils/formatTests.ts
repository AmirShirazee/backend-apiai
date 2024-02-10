import * as prettier from "prettier";

export const formatTests = async (
  tests: Map<string, string>
): Promise<string> => {
  const testCases = Array.from(tests.values()).join("\n\n");

  return await prettier.format(testCases, {
    parser: "typescript",
  });
};
