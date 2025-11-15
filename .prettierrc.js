/** @type {import("prettier").Config} */
const config = {
  // Use single quotes instead of double quotes
  singleQuote: true,

  // Print trailing commas in objects and arrays where valid in ES5
  trailingComma: 'es5', 

  // Specify the line length that the printer will wrap on
  printWidth: 100,

  // Use tabs instead of spaces
  useTabs: false,

  // Number of spaces per indentation level
  tabWidth: 2, 

  // Include parentheses around a sole arrow function parameter
  arrowParens: 'always', 

  // Do not add a space between function name and parenthesis (e.g., functionName())
  // Use 'avoid' for the backend and 'always' for React files
  semi: true,

  // Only format files we care about (this is often handled via .prettierignore)
  // files: [
  //   '**/*.{js,jsx,ts,tsx,json,css,scss,md}'
  // ]
};

module.exports = config;