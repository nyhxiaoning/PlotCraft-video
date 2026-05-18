/**
 * AI Provider 配置设置组件
 * 用于 Settings 页面，配置和管理所有 AI 提供商
 */

import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Loader,
  Key,
  Star,
  ExternalLink,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MODEL_PROVIDERS, getModelsByProvider } from '@/core/config/models.config';
import { useApiKey } from '@/hooks/useSettings';
import { useSettings } from '@/context/SettingsContext';
import type { ModelProvider } from '@/core/types';
import { toast } from '@/shared/components/ui/Toast';

// 图标映射（使用 emoji 作为 fallback）
const PROVIDER_EMOJIS: Record<string, string> = {
  openai: '🤖',
  anthropic: '🧠',
  google: '🔍',
  baidu: '🔴',
  alibaba: '☁️',
  zhipu: '🟢',
  iflytek: '🔵',
  tencent: '🟣',
  minimax: '⭐',
  moonshot: '🌙',
  bytedance: '🎵',
  kling: '🎬',
};

interface ProviderConfigCardProps {
  providerKey: ModelProvider;
  isActive: boolean;
  onSetActive: () => void;
}

function ProviderConfigCard({ providerKey, isActive, onSetActive }: ProviderConfigCardProps) {
  const provider = MODEL_PROVIDERS[providerKey];
  const { apiKey, updateApiKey, validateApiKey } = useApiKey(providerKey);
  const models = getModelsByProvider(providerKey);

  const [keyInput, setKeyInput] = useState(apiKey.value || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  if (!provider) return null;

  // 同步 apiKey.value 到 keyInput（首次加载或外部更新时）
  React.useEffect(() => {
    if (apiKey.value && !keyInput) {
      setKeyInput(apiKey.value);
    }
  }, [apiKey.value]);

  const handleSaveKey = async () => {
    await updateApiKey({ value: keyInput, isValid: null });
    toast.success(`${provider.name} API Key 已保存`);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    // 先保存再测试
    if (keyInput !== apiKey.value) {
      await updateApiKey({ value: keyInput, isValid: null });
    }
    const valid = await validateApiKey();
    setTesting(false);
    if (valid) {
      toast.success(`${provider.name} 连接成功 ✓`);
    } else {
      toast.error(`${provider.name} 连接失败，请检查 API Key`);
    }
  };

  const isConfigured = !!apiKey.value;

  return (
    <Card className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PROVIDER_EMOJIS[providerKey] || '🔹'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{provider.name}</span>
              {isActive && (
                <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                  当前使用
                </Badge>
              )}
              {isConfigured ? (
                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                  已配置
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  未配置
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                Key 格式: {provider.keyFormat}
              </span>
              <a
                href={provider.apiDocs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
              >
                <ExternalLink className="h-3 w-3" /> 文档
              </a>
            </div>
          </div>
        </div>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={onSetActive}
          className="shrink-0"
        >
          <Star className="h-3.5 w-3.5 mr-1" />
          {isActive ? '使用中' : '设为默认'}
        </Button>
      </div>

      <div className="space-y-3">
        {/* API Key 输入 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder={`输入 ${provider.name} API Key`}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKey(!showKey)}
            className="shrink-0 text-xs"
          >
            {showKey ? '隐藏' : '显示'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveKey} className="shrink-0">
            保存
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={!isConfigured || testing}
            className="shrink-0"
          >
            {testing ? (
              <Loader className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1" />
            )}
            测试
          </Button>
        </div>

        {/* 连接状态 */}
        {apiKey.isValid !== null && (
          <div className={`flex items-center gap-1.5 text-xs ${apiKey.isValid ? 'text-green-600' : 'text-red-500'}`}>
            {apiKey.isValid ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                连接正常
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                连接失败
              </>
            )}
          </div>
        )}

        {/* 模型选择 */}
        {models.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">可用模型:</Label>
            <div className="flex flex-wrap gap-1.5">
              {models.map((model) => (
                <Badge key={model.id} variant="outline" className="text-xs">
                  {model.name}
                  {model.isPro && <span className="ml-0.5 text-yellow-500">*</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function AiProviderSettings() {
  const { settings, updateSettings } = useSettings();
  const [filter, setFilter] = useState<'all' | 'configured' | 'unconfigured'>('all');

  const providerKeys = Object.keys(MODEL_PROVIDERS) as ModelProvider[];

  // 检查各个 provider 配置状态
  const ProviderList = () => {
    const [configuredKeys, setConfiguredKeys] = useState<Set<string>>(new Set());

    // 这个 callback 用于通知父组件哪些 provider 已配置
    // 但由于 useApiKey 在子组件中，我们用 filter 控制显示
    // 实际上 filter 功能简化处理，因为 hooks 限制无法在这里检查所有 key

    return (
      <div className="space-y-3">
        {providerKeys.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <ProviderConfigCard
              providerKey={key}
              isActive={settings.preferredAIProvider === key}
              onSetActive={() => updateSettings({ preferredAIProvider: key })}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 头部说明 */}
      <div>
        <h3 className="text-lg font-semibold mb-1">AI 模型提供商</h3>
        <p className="text-sm text-muted-foreground mb-3">
          配置各 AI 服务商的 API Key，选择默认使用的提供商。当前使用:{' '}
          <span className="font-medium text-foreground">
            {MODEL_PROVIDERS[settings.preferredAIProvider as ModelProvider]?.name ||
              settings.preferredAIProvider}
          </span>
        </p>
      </div>

      <ProviderList />

      <Separator />

      {/* 使用统计概览 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">API 使用统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本月调用</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                <Globe className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">消耗 Tokens</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">成功调用</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
