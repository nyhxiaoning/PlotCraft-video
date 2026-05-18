/**
 * 专业设置页面
 */

import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Bell,
  Info,
  Lightbulb,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/context/ThemeContext';
import { AiProviderSettings } from '@/features/ai/components';

import styles from './Settings.module.less';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={styles.settings}>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回主页
        </Button>
      </div>
      <Card className={styles.settingsCard}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" /> API 配置
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" /> 通用设置
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" /> 账户
            </TabsTrigger>
            <TabsTrigger value="notification" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> 通知
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" /> 关于
            </TabsTrigger>
          </TabsList>

          {/* API 配置 */}
          <TabsContent value="api" className="space-y-6">
            <AiProviderSettings />
          </TabsContent>

          {/* 通用设置 */}
          <TabsContent value="general" className="space-y-6">
            <div className={styles.section}>
              <h3 className="text-lg font-semibold mb-2">主题设置</h3>
              <p className="text-muted-foreground mb-4">
                选择您喜欢的主题模式，主题更改将立即生效。
              </p>

              <RadioGroup
                value={isDarkMode ? 'dark' : 'light'}
                onChange={(value: string) => {
                  if (value !== (isDarkMode ? 'dark' : 'light')) {
                    toggleTheme();
                  }
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    浅色模式
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    暗黑模式
                  </Label>
                </div>
              </RadioGroup>

              <Alert className="mt-4">
                <AlertDescription>
                  {isDarkMode
                    ? '当前为暗黑模式，适合夜间使用，减少眼睛疲劳。'
                    : '当前为浅色模式，适合白天使用，界面更清晰。'}
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            <div className={styles.section}>
              <h3 className="text-lg font-semibold mb-4">基本设置</h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>项目保存路径</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="/Users/username/panel-flow AI/projects"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      浏览
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>默认视频分辨率</Label>
                  <Select defaultValue="1080p">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="2k">2K</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>默认帧率</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>自动保存间隔</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} max={60} defaultValue={5} className="w-20" />
                    <span className="text-muted-foreground">分钟</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className={styles.section}>
              <h3 className="text-lg font-semibold mb-4">开关设置</h3>

              <div className="space-y-4">
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>自动保存项目</Label>
                    <p className="text-sm text-muted-foreground">工作进度自动保存到本地</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>显示高级选项</Label>
                    <p className="text-sm text-muted-foreground">在界面中显示更多高级配置</p>
                  </div>
                  <Switch />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>启用快捷键</Label>
                    <p className="text-sm text-muted-foreground">使用键盘快捷键提高效率</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>启动时检查更新</Label>
                    <p className="text-sm text-muted-foreground">自动检查新版本并提示更新</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 账户 */}
          <TabsContent value="account" className="space-y-6">
            <Card className={styles.accountCard}>
              <div className={styles.accountInfo}>
                <Avatar className="h-20 w-20">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className={styles.accountDetail}>
                  <h3 className="text-lg font-semibold">用户账户</h3>
                  <p className="text-sm text-muted-foreground">创建时间：2026-02-15</p>
                  <Badge variant="outline" className="mt-2">
                    免费版
                  </Badge>
                </div>
              </div>
            </Card>

            <Separator />

            <div className={styles.section}>
              <h3 className="text-lg font-semibold mb-4">账户设置</h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>显示名称</Label>
                  <Input placeholder="输入您的名称" />
                </div>

                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input placeholder="your@email.com" />
                </div>

                <Button>保存更改</Button>
              </div>
            </div>
          </TabsContent>

          {/* 通知 */}
          <TabsContent value="notification" className="space-y-6">
            <div className={styles.section}>
              <h3 className="text-lg font-semibold mb-4">通知设置</h3>

              <div className="space-y-4">
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>项目完成通知</Label>
                    <p className="text-sm text-muted-foreground">项目生成完成时推送通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>错误提醒</Label>
                    <p className="text-sm text-muted-foreground">发生错误时推送通知</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>API 配额提醒</Label>
                    <p className="text-sm text-muted-foreground">API 使用达到 80% 时提醒</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <Label>更新推送</Label>
                    <p className="text-sm text-muted-foreground">新版本发布时推送通知</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-6">
            <Card className={styles.aboutCard}>
              <div className={styles.aboutHeader}>
                <h2 className="text-2xl font-bold">🎬 panel-flow AI</h2>
                <p className="text-muted-foreground">AI 视频脚本视频智能创作平台</p>
              </div>

              <div className={styles.aboutInfo}>
                <div className={styles.infoItem}>
                  <span className="text-muted-foreground">版本</span>
                  <span>v2.1.0</span>
                </div>
                <div className={styles.infoItem}>
                  <span className="text-muted-foreground">构建时间</span>
                  <span>2026-02-22</span>
                </div>
                <div className={styles.infoItem}>
                  <span className="text-muted-foreground">许可证</span>
                  <span>MIT</span>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertDescription>
                  感谢使用 panel-flow AI，如有问题或建议，请提交 Issue 或联系开发者。
                </AlertDescription>
              </Alert>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
