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
	// Empty strings emit a blank line between groups, so the grouping is
	// enforced on every format: packages, kit modules, components, services,
	// utilities, assets/other $lib, relative.
	importOrder: [
		"<BUILTIN_MODULES>",
		"",
		"<THIRD_PARTY_MODULES>",
		"",
		"^\\$app/(.*)$",
		"^\\$env/(.*)$",
		"",
		"^\\$lib/components/(.*)$",
		"",
		"^\\$lib/player(.*)$",
		"",
		"^\\$lib/utilities/(.*)$",
		"",
		"^\\$lib/(.*)$",
		"",
		"^[./]"
	],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	tailwindStylesheet: "./src/routes/layout.css"
};

export default config;
