// AI配置相关类型定义
export interface CustomProvider {
  name: string
  apiDomain: string
  apiPath: string
  modelName: string
}

export interface ProviderConfig {
  provider?: string
  model: string
  apiKey: string
  proxyUrl: string
  customProviders?: CustomProvider[]
  modelConfigs?: Record<string, {
    temperature: number
    maxTokens: number
    topP: number
  }>
}