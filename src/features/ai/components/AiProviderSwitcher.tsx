/**
 * AI Provider 快速切换组件
 * 用于全局 header，快速切换和查看当前 AI 提供商状态
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Settings,
  Loader,
  ExternalLink,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MODEL_PROVIDERS } from '@/core/config/models.config';
import { useSettings } from '@/context/SettingsContext';
import { useApiKey } from '@/hooks/useSettings';
import type { ModelProvider } from '@/core/types';

// 提供商 emoji 图标
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

export default function AiProviderSwitcher() {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();

  const activeProvider = settings.preferredAIProvider as ModelProvider;
  const activeProviderInfo = MODEL_PROVIDERS[activeProvider];
  const providerKeys = Object.keys(MODEL_PROVIDERS) as ModelProvider[];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={settings.preferredAIProvider}
        onValueChange={(value) => updateSettings({ preferredAIProvider: value })}
      >
        <SelectTrigger className="w-[180px] h-8 text-sm">
          <SelectValue>
            {activeProviderInfo ? (
              <div className="flex items-center gap-2">
                <span>{PROVIDER_EMOJIS[activeProvider] || '🔹'}</span>
                <span>{activeProviderInfo.name}</span>
              </div>
            ) : (
              <span>选择 AI 提供商</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {providerKeys.map((key) => {
            const info = MODEL_PROVIDERS[key];
            if (!info) return null;
            return (
              <SelectItem key={key} value={key} className="py-1.5">
                <div className="flex items-center gap-2">
                  <span>{PROVIDER_EMOJIS[key] || '🔹'}</span>
                  <span>{info.name}</span>
                </div>
              </SelectItem>
            );
          })}
          <div className="border-t mt-1 pt-1 px-1">
            <button
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-3.5 w-3.5" />
              管理配置
            </button>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
