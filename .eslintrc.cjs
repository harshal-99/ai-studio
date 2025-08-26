/* eslint-env node */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "react-refresh", "react-hooks"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
	],
	env: {browser: true, es2023: true},
	settings: {react: {version: "detect"}},
	rules: {
		"react-refresh/only-export-components": "warn",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-misused-promises": "warn"
	}
};
