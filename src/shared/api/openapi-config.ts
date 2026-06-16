import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: './api.json',
  apiFile: './rtkApi.ts',
  apiImport: 'rtkApi',
  // filterEndpoints: (_, operationDefinition) => operationDefinition.path.includes('support'),
  outputFile: './generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
}

export default config

// Команда для генерации:
// npx @rtk-query/codegen-openapi openapi-config.ts
// Resources Chat KnowledgeBase