/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: false,
	trailingComma: "none",
	printWidth: 100,
	plugins: [
		"@ianvs/prettier-plugin-sort-imports",
		"prettier-plugin-svelte",
		"prettier-plugin-tailwindcss"
	],
	importOrder: [
		"<BUILTIN_MODULES>",
		"<THIRD_PARTY_MODULES>",
		"^\\$app/(.*)$",
		"^\\$env/(.*)$",
		"^\\$lib/(.*)$",
		"^[./]"
	],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	tailwindStylesheet: "./src/routes/layout.css"
};

export default config;
