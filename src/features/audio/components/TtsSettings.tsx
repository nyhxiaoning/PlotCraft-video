/**
 * TTS 配音配乐配置组件
 * 用于配置配音配乐的音色、语速、音调等
 */

import { AudioLines, Play, Save, StopCircle, Volume2, Loader } from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_TTS_CONFIG, TTS_VOICES } from '@/core/services/tts.service';
import type { TTSConfig, TTSProvider, TTSVoice } from '@/core/types';
import { toast } from '@/shared/components/ui/Toast';

// 提供商名称映射
const PROVIDER_NAMES: Record<TTSProvider, string> = {
  edge: 'Edge TTS（微软，免费）',
  azure: 'Azure TTS',
  aliyun: '阿里云 TTS',
  baidu: '百度 TTS',
  iflytek: '科大讯飞 TTS',
  cosyvoice: 'CosyVoice',
};

interface TtsSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: Partial<TTSConfig>;
  onSave?: (config: TTSConfig) => void;
}

export default function TtsSettings({ open, onOpenChange, config, onSave }: TtsSettingsProps) {
  const [provider, setProvider] = useState<TTSProvider>(
    config?.provider || DEFAULT_TTS_CONFIG.provider
  );
  const [voice, setVoice] = useState<string>(config?.voice || DEFAULT_TTS_CONFIG.voice);
  const [speed, setSpeed] = useState<number>(config?.speed || DEFAULT_TTS_CONFIG.speed);
  const [pitch, setPitch] = useState<number>(config?.pitch || DEFAULT_TTS_CONFIG.pitch);
  const [volume, setVolume] = useState<number>(config?.volume || DEFAULT_TTS_CONFIG.volume);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewText, setPreviewText] = useState('欢迎使用 AI 配音功能，这是语音预览效果。');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = TTS_VOICES[provider] || [];
  const currentVoice = voices.find((v) => v.id === voice);

  const handleProviderChange = (newProvider: TTSProvider) => {
    setProvider(newProvider);
    const providerVoices = TTS_VOICES[newProvider] || [];
    // 切换到新提供商时自动选择第一个音色
    if (providerVoices.length > 0 && !providerVoices.find((v) => v.id === voice)) {
      setVoice(providerVoices[0].id);
    }
  };

  const handlePreview = useCallback(async () => {
    if (!previewText.trim()) {
      toast.warning('请输入预览文本');
      return;
    }

    setIsPreviewing(true);

    try {
      // 使用现有的 TTS 服务进行预览
      const { ttsService } = await import('@/core/services/tts.service');
      const result = await ttsService.synthesize({
        text: previewText,
        config: {
          provider,
          voice,
          speed,
          pitch,
          volume,
          format: 'audio-24khz-48kbitrate-mono-mp3',
        },
      });

      // 播放音频
      const mimeType = result.format || 'audio/mpeg';
      const blob = new Blob([result.audio], { type: mimeType });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPreviewing(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPreviewing(false);
        URL.revokeObjectURL(url);
        toast.error('播放预览失败');
      };
      await audio.play();
    } catch (error) {
      setIsPreviewing(false);
      toast.error(`语音合成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [previewText, provider, voice, speed, pitch, volume]);

  const handleStopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPreviewing(false);
  };

  const handleSave = () => {
    const finalConfig: TTSConfig = {
      provider,
      voice,
      speed,
      pitch,
      volume,
      format: 'audio-24khz-48kbitrate-mono-mp3',
    };
    onSave?.(finalConfig);
    toast.success('配音配置已保存');
    onOpenChange(false);
  };

  const providerKeys = Object.keys(PROVIDER_NAMES) as TTSProvider[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AudioLines className="h-5 w-5" />
            配音配乐配置
          </DialogTitle>
          <DialogDescription>选择 TTS 服务商、音色、调整语速音调，并预览效果</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* TTS 提供商选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">TTS 服务商</Label>
            <Select value={provider} onValueChange={(v) => handleProviderChange(v as TTSProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {PROVIDER_NAMES[key]}
                      {key !== 'edge' && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          需 API Key
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {provider !== 'edge' && (
              <p className="text-xs text-muted-foreground mt-1">
                {PROVIDER_NAMES[provider]} 需要配置 API Key，将自动回退到 Edge TTS
              </p>
            )}
          </div>

          {/* 音色选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">音色</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {voices.map((v) => (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    voice === v.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => setVoice(v.id)}
                >
                  <Volume2
                    className={`h-4 w-4 ${voice === v.id ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.gender === 'female' ? '女声' : '男声'} · {v.language}
                    </div>
                  </div>
                  {v.style && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {v.style}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 参数调节 */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-medium">参数调节</h4>

            {/* 语速 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">语速</Label>
                <span className="text-xs text-muted-foreground">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>慢</span>
                <span>快</span>
              </div>
            </div>

            {/* 音调 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">音调</Label>
                <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}x</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={([v]) => setPitch(v)}
                min={0.5}
                max={1.5}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            {/* 音量 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">音量</Label>
                <span className="text-xs text-muted-foreground">{volume}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                min={0}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>静音</span>
                <span>最大</span>
              </div>
            </div>
          </div>

          {/* 预览区域 */}
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">预览</Label>
              <div className="flex items-center gap-2">
                {currentVoice && (
                  <span className="text-xs text-muted-foreground">
                    {currentVoice.name} · {currentVoice.gender === 'female' ? '女声' : '男声'}
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="输入要预览的文本..."
              rows={2}
            />
            <div className="flex items-center gap-2">
              {isPreviewing ? (
                <Button variant="outline" size="sm" onClick={handleStopPreview}>
                  <StopCircle className="h-4 w-4 mr-1" />
                  停止
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <Play className="h-4 w-4 mr-1" />
                  播放预览
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
