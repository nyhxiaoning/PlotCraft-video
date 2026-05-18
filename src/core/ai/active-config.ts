/**
 * 活跃 AI 模型配置
 * 从 settings 中读取用户首选的 AI 提供者并映射到模型
 * 可在非 React 上下文（pipeline、service）中使用
 */

import { MODEL_PROVIDERS, AI_MODELS, getModelsByProvider } from '@/core/config/models.config';
import type { ModelProvider } from '@/core/types';

interface ActiveAIConfig {
  provider: ModelProvider;
  model: string;
}

const SETTINGS_KEY = 'app_settings';

function getSettings(): Record<string, unknown> {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 获取用户首选的 AI 提供者
 * 如果未设置，返回 'openai'
 */
export function getPreferredProvider(): ModelProvider {
  const settings = getSettings();
  return (settings.preferredAIProvider as ModelProvider) || 'openai';
}

/**
 * 获取用户首选的 AI 类别
 */
export function getPreferredCategory(): string {
  const settings = getSettings();
  return (settings.preferredAICategory as string) || 'all';
}

/**
 * 获取当前 AI 配置（模型 + 提供商）
 * 优先级：
 * 1. 用户设置的 preferredAIProvider
 * 2. fallback 参数
 * 3. 默认值（openai / gpt-4.5）
 */
export function getActiveModelConfig(fallback?: ActiveAIConfig): ActiveAIConfig {
  const settings = getSettings();
  const preferredProvider = (settings.preferredAIProvider as ModelProvider) || fallback?.provider || 'openai';

  // 先看用户有没有存 preferredModel
  const preferredModel = settings.preferredModel as string | undefined;

  // 如果指定了模型且在 AI_MODELS 中存在，使用它
  if (preferredModel && AI_MODELS.some((m) => m.id === preferredModel)) {
    const model = AI_MODELS.find((m) => m.id === preferredModel)!;
    return { provider: model.provider, model: model.id };
  }

  // 否则从首选提供商中选第一个模型
  const providerModels = getModelsByProvider(preferredProvider);
  if (providerModels.length > 0) {
    return { provider: preferredProvider, model: providerModels[0].id };
  }

  // 完全 fallback
  return fallback ?? { provider: 'openai' as ModelProvider, model: 'gpt-4.5' };
}

/**
 * 获取首选提供商对应的推荐模型（脚本生成场景）
 */
export function getRecommendedModelForProvider(provider: ModelProvider): string {
  const models = getModelsByProvider(provider);
  if (models.length === 0) return 'gpt-4.5';

  // 优先选非 Pro、文本类模型（性价比优先）
  const textModel = models.find((m) => m.category.includes('text') && !m.isPro);
  if (textModel) return textModel.id;

  return models[0].id;
}
