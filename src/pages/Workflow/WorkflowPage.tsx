/**
 * 视频脚本工作流页面
 */

import { Zap, Play, Settings, AudioLines, Volume2, Settings2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_TTS_CONFIG, TTS_VOICES } from '@/core/services/tts.service';
import type { TTSConfig } from '@/core/types';
import { TtsSettings } from '@/features/audio/components';
import { toast } from '@/shared/components/ui/Toast';

import styles from './WorkflowPage.module.less';

const PROVIDER_NAMES: Record<string, string> = {
  edge: 'Edge TTS（微软，免费）',
  azure: 'Azure TTS',
  aliyun: '阿里云 TTS',
  baidu: '百度 TTS',
  iflytek: '科大讯飞 TTS',
  cosyvoice: 'CosyVoice',
};

const WORKFLOW_STEPS = [
  { key: 'import', title: '导入', description: '小说/剧本' },
  { key: 'analysis', title: 'AI解析', description: '智能分析' },
  { key: 'script', title: '剧本', description: '生成剧本' },
  { key: 'storyboard', title: '分镜', description: '漫画分镜' },
  { key: 'character', title: '角色', description: '角色形象' },
  { key: 'render', title: '渲染', description: '场景渲染' },
  { key: 'animate', title: '合成', description: '动态效果' },
  { key: 'audio', title: '配音', description: '配音配乐' },
  { key: 'export', title: '导出', description: '视频导出' },
];

const WorkflowPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workflow');
  const [currentStep, _setCurrentStep] = useState(0);
  const [ttsSettingsOpen, setTtsSettingsOpen] = useState(false);
  const [ttsConfig, setTtsConfig] = useState<TTSConfig>(DEFAULT_TTS_CONFIG);

  const currentVoice = useMemo(() => {
    const voices = TTS_VOICES[ttsConfig.provider] || [];
    return voices.find((v) => v.id === ttsConfig.voice);
  }, [ttsConfig.provider, ttsConfig.voice]);

  const handleStartWorkflow = () => {
    toast.info('开始创建工作流...');
    navigate('/project/new');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-semibold m-0">视频脚本工作流</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            设置
          </Button>
          <Button variant="default" size="sm" onClick={handleStartWorkflow}>
            <Play className="h-4 w-4 mr-1" />
            开始创建
          </Button>
        </div>
      </div>

      <Card className={styles.workflowCard}>
        <div className={styles.steps}>
          {WORKFLOW_STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`${styles.step} ${index <= currentStep ? styles.stepActive : ''}`}
              onClick={() => {
                if (step.key === 'audio') {
                  setTtsSettingsOpen(true);
                }
              }}
              style={step.key === 'audio' ? { cursor: 'pointer' } : undefined}
            >
              <div className={styles.stepNumber}>
                {step.key === 'audio' ? <AudioLines className="h-4 w-4" /> : index + 1}
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.description}</div>
                {step.key === 'audio' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTtsSettingsOpen(true);
                    }}
                  >
                    <Settings2 className="h-3 w-3 mr-1" />
                    TTS 配置
                  </Button>
                )}
              </div>
              {index < WORKFLOW_STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList>
          <TabsTrigger value="workflow">工作流</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
          <TabsTrigger value="templates">模板</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AudioLines className="h-5 w-5" />
                  配音配乐配置
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  选择 TTS 服务商和音色，调整配音参数
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTtsSettingsOpen(true)}>
                <Settings2 className="h-4 w-4 mr-1" />
                配置配音
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">TTS 服务商</span>
                <p className="text-sm font-medium">
                  {PROVIDER_NAMES[ttsConfig.provider] || ttsConfig.provider}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">音色</span>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  {currentVoice
                    ? `${currentVoice.name}（${currentVoice.gender === 'female' ? '女声' : '男声'}）`
                    : ttsConfig.voice}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">语速 / 音调</span>
                <p className="text-sm font-medium">
                  {ttsConfig.speed.toFixed(1)}x / {ttsConfig.pitch.toFixed(1)}x
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">音量</span>
                <p className="text-sm font-medium">{ttsConfig.volume}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">开始创作</h3>
            <p className="text-muted-foreground">选择或创建新的工作流，开始视频制作</p>
            <Button variant="default" className="mt-4" onClick={handleStartWorkflow}>
              创建新工作流
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <p className="text-muted-foreground">暂无历史记录</p>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <p className="text-muted-foreground">暂无模板</p>
          </Card>
        </TabsContent>
      </Tabs>

      <TtsSettings
        open={ttsSettingsOpen}
        onOpenChange={setTtsSettingsOpen}
        config={ttsConfig}
        onSave={setTtsConfig}
      />
    </div>
  );
};

export default WorkflowPage;
