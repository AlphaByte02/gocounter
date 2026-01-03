import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginPrettier from "eslint-plugin-prettier/recommended";

export default [
    {
        ignores: ["**/dist", "**/router.ts"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        rules: {
            indent: ["error", 4, { SwitchCase: 1 }],
        },
    },
    {
        languageOptions: {
            ...jsxA11y.flatConfigs.recommended.languageOptions,
            parserOptions: {
                ...jsxA11y.flatConfigs.recommended.languageOptions.parserOptions,
                warnOnUnsupportedTypeScriptVersion: false,
            },
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat["jsx-runtime"],
    {
        plugins: {
            pluginReact,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {},
    },
    {
        plugins: {
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        },
    },
    {
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
        },
    },
    jsxA11y.flatConfigs.recommended,
    pluginPrettier,
];
