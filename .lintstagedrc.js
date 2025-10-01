module.exports = {
  // Lint and format TypeScript and JavaScript files
  '**/*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],

  // Format CSS and SCSS files
  '**/*.{css,scss,sass}': [
    'prettier --write'
  ],

  // Format JSON files
  '**/*.{json,jsonc}': [
    'prettier --write'
  ],

  // Format Markdown files
  '**/*.{md,mdx}': [
    'prettier --write'
  ],

  // Format YAML files
  '**/*.{yml,yaml}': [
    'prettier --write'
  ],

  // Type check TypeScript files (without emitting files)
  '**/*.{ts,tsx}': () => 'tsc --noEmit'
}