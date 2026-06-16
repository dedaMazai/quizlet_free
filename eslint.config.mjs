import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import i18next from 'eslint-plugin-i18next';
import unusedImports from 'eslint-plugin-unused-imports';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    // Global ignores
    {
        ignores: [
            'node_modules/**',
            'build/**',
            'dist/**',
            '*.config.js',
            '*.config.ts',
            '*.config.mjs',
            'config/**',
            'public/**',
            '**/*.d.ts',
        ],
    },

    // Base configuration
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // React configuration
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
            i18next,
            'unused-imports': unusedImports,
            'import-x': importX,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
                __IS_DEV__: 'readonly',
                __API__: 'readonly',
                __API_CHATS__: 'readonly',
                __PROJECT__: 'readonly',
                __APP_VERSION__: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // React rules
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/require-default-props': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/function-component-definition': 'off',
            'react/jsx-filename-extension': [
                'error',
                { extensions: ['.jsx', '.tsx'] },
            ],
            'react/jsx-max-props-per-line': ['error', { maximum: 4 }],
            'react/no-unstable-nested-components': 'warn',
            'react/no-array-index-key': 'off',
            'react/no-unstable-nested-components': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',

            // React Hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',

            // TypeScript rules
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-require-imports': 'off',

            // Import rules
            'unused-imports/no-unused-imports': 'warn',
            'import-x/no-unresolved': 'off',
            'import-x/prefer-default-export': 'off',
            'import-x/extensions': 'off',
            'import-x/no-extraneous-dependencies': 'off',

            // i18next rules
            'i18next/no-literal-string': [
                'warn',
                {
                    markupOnly: true,
                    ignoreAttribute: [
                        'as',
                        'role',
                        'data-testid',
                        'to',
                        'target',
                        'justify',
                        'align',
                        'border',
                        'direction',
                        'gap',
                        'feature',
                        'color',
                        'variant',
                        'size',
                        'wrap',
                        'name',
                        'type',
                        'id',
                        'className',
                        'href',
                        'src',
                        'alt',
                    ],
                },
            ],

            // a11y rules (relaxed)
            'jsx-a11y/no-static-element-interactions': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',

            // General rules
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'warn',
            'no-underscore-dangle': 'off',
            'no-param-reassign': 'off',
            'no-plusplus': 'off',
            'camelcase': 'off',
            'arrow-body-style': 'off',
            'max-len': [
                'error',
                {
                    code: 125,
                    ignoreComments: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreUrls: true,
                },
            ],
        },
    },

    // Test files configuration
    {
        files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}'],
        rules: {
            'i18next/no-literal-string': 'off',
            'max-len': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    // Prettier must be last
    prettier,
);

