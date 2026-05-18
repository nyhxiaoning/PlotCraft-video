import { FileText, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { scriptImportService, tauriService } from '@/core/services';
import type { ScriptChapter, ScriptSource, ScriptValidationResult } from '@/core/types';
import { logger } from '@/core/utils/logger';
import { Loading } from '@/shared/components/ui';

import styles from './NovelImporter.module.less';

interface NovelImporterProps {
  initialContent?: string;
  onContentLoad: (content: string, metadata: NovelMetadata) => void;
  onRemove?: () => void;
  loading?: boolean;
}

export interface NovelMetadata {
  filename: string;
  fileFormat: ScriptSource['fileFormat'];
  sourceType: ScriptSource['sourceType'];
  fileSize: number;
  charCount: number;
  estimatedChapters: number;
  chapterCount: number;
  chapters: ScriptChapter[];
  validation: ScriptValidationResult;
}

/**
 * 小说/剧本导入组件
 * 支持导入 txt, md, docx 格式的小说或剧本文件
 */
function NovelImporter({
  initialContent,
  onContentLoad,
  onRemove,
  loading = false,
}: NovelImporterProps) {
  const [content, setContent] = useState<string | null>(initialContent || null);
  const [metadata, setMetadata] = useState<NovelMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const buildMetadata = (
    nextContent: string,
    params: { filename: string; sourceType: ScriptSource['sourceType']; filePath?: string }
  ): NovelMetadata => {
    const result = scriptImportService.analyzeImport({
      content: nextContent,
      filename: params.filename,
      sourceType: params.sourceType,
      filePath: params.filePath,
    });

    return {
      filename: result.source.filename,
      fileFormat: result.source.fileFormat,
      sourceType: result.source.sourceType,
      fileSize: result.source.fileSize,
      charCount: result.source.charCount,
      estimatedChapters: result.estimatedChapters,
      chapterCount: result.chapters.length,
      chapters: result.chapters,
      validation: result.validation,
    };
  };

  /**
   * 浏览器环境下的备用文件选择和读取
   */
  const handleBrowserFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.docx';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      try {
        const text = await file.text();
        const filename = file.name;

        const novelMetadata = buildMetadata(text, {
          filename,
          sourceType: 'file',
        });

        const errors = novelMetadata.validation.issues.filter((issue) => issue.level === 'error');
        if (errors.length > 0) {
          toast.error(errors[0].message);
          setIsLoading(false);
          return;
        }

        setContent(text);
        setMetadata(novelMetadata);
        onContentLoad(text, novelMetadata);
        toast.success('小说文件导入成功');
      } catch (err) {
        logger.error('浏览器读取文件失败:', err);
        toast.error('读取文件失败，请确保文件格式正确');
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  /**
   * 选择小说文件
   */
  const handleSelectFile = async () => {
    try {
      // 判断是否在 Tauri 环境中
      const isTauriEnv = !!(window as any).__TAURI_INTERNALS__;

      if (!isTauriEnv) {
        // 如果是在普通浏览器（如网页预览）中，使用原生的 Input 方案
        handleBrowserFileSelect();
        return;
      }

      // 打开文件选择对话框 (Tauri 环境)
      const selected = await tauriService.openFile({
        multiple: false,
        filters: [
          {
            name: '小说/剧本文件',
            extensions: ['txt', 'md', 'docx'],
          },
        ],
      });

      console.log('Tauri openFile result:', selected);

      // 如果用户取消选择，selected将是null
      if (!selected) {
        return;
      }

      let filePath: string = '';
      if (typeof selected === 'string') {
        filePath = selected;
      } else if (Array.isArray(selected) && selected.length > 0) {
        // 如果返回的是数组
        const first = selected[0];
        filePath = typeof first === 'string' ? first : (first as any).path || '';
      } else if (typeof selected === 'object' && selected !== null) {
        // 如果返回的是对象
        filePath = (selected as any).path || '';
        // 如果是一个真正的空对象 {}（Tauri 取消选择的 bug）
        if (!filePath && Object.keys(selected).length === 0) {
          return;
        }
      }

      if (!filePath) {
        toast.error(`无法获取文件路径: ${JSON.stringify(selected)}`);
        return;
      }
      setIsLoading(true);

      try {
        // 优先使用 Tauri FS 读文本，统一跨平台行为
        const fileContent = await tauriService.readText(filePath);

        // 获取文件名
        const filename = filePath.split(/[\\/]/).pop() || '未知文件';

        // 计算元数据和章节切分
        const novelMetadata = buildMetadata(fileContent, {
          filename,
          sourceType: 'file',
          filePath,
        });

        const warnings = novelMetadata.validation.issues.filter(
          (issue) => issue.level === 'warning'
        );
        const errors = novelMetadata.validation.issues.filter((issue) => issue.level === 'error');

        if (errors.length > 0) {
          toast.error(errors[0].message);
          return;
        }

        setContent(fileContent);
        setMetadata(novelMetadata);
        onContentLoad(fileContent, novelMetadata);

        if (warnings.length > 0) {
          toast.warning(warnings[0].message);
        }
        toast.success('小说文件导入成功');
      } catch (error) {
        logger.error('读取文件失败:', error);
        toast.error('读取文件失败，请重试（建议使用 TXT/MD 编码格式）');
      } finally {
        setIsLoading(false);
      }
    } catch (error: any) {
      logger.error('选择文件失败:', error);
      toast.error(`选择文件失败: ${error?.message || JSON.stringify(error)}`);
    }
  };

  /**
   * 手动输入内容
   */
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      toast.warning('请输入内容');
      return;
    }

    const novelMetadata = buildMetadata(manualInput, {
      filename: '手动输入',
      sourceType: 'manual',
    });

    const errors = novelMetadata.validation.issues.filter((issue) => issue.level === 'error');
    if (errors.length > 0) {
      toast.error(errors[0].message);
      return;
    }

    setContent(manualInput);
    setMetadata(novelMetadata);
    onContentLoad(manualInput, novelMetadata);
    toast.success('内容导入成功');
  };

  /**
   * 移除内容
   */
  const handleRemove = () => {
    setContent(null);
    setMetadata(null);
    setManualInput('');
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={styles.novelImporter}>
      {(loading || isLoading) && <Loading tip={isLoading ? '导入中...' : '加载中...'} />}

      {!content ? (
        <div className={styles.uploadArea}>
          <Card>
            <div className={styles.uploadOptions}>
              <div className={styles.uploadOption}>
                <h4>方式一：选择文件</h4>
                <p>支持 TXT、MD、DOCX 格式的小说或剧本文件</p>
                <Button onClick={handleSelectFile} disabled={isLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  选择文件
                </Button>
              </div>

              <div className={styles.divider}>
                <span>或</span>
              </div>

              <div className={styles.uploadOption}>
                <h4>方式二：直接输入</h4>
                <p>直接在下方输入框中粘贴或输入小说/剧本内容</p>
                <Textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="请输入小说或剧本内容..."
                  rows={6}
                />
                <Button
                  onClick={handleManualInput}
                  disabled={!manualInput.trim()}
                  style={{ marginTop: 8 }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  导入内容
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className={styles.contentPreview}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText className="h-4 w-4" />
                <span>{metadata?.filename}</span>
              </div>
            }
            extra={
              <Button variant="destructive" onClick={handleRemove}>
                <Trash2 className="h-4 w-4 mr-2" />
                移除
              </Button>
            }
          >
            {metadata && (
              <Alert className="mb-4">
                <AlertDescription>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>文件名: {metadata.filename}</span>
                    <span>字符数: {metadata.charCount.toLocaleString()}</span>
                    <span>识别格式: {metadata.fileFormat.toUpperCase()}</span>
                    <span>章节数: {metadata.chapterCount}</span>
                    <span>预估章节数: {metadata.estimatedChapters}</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className={styles.contentPreviewBox}>
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (metadata) {
                    const newMetadata = buildMetadata(e.target.value, {
                      filename: metadata.filename,
                      sourceType: metadata.sourceType,
                    });
                    setMetadata(newMetadata);
                    onContentLoad(e.target.value, newMetadata);
                  }
                }}
                rows={10}
                placeholder="内容预览和编辑..."
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default NovelImporter;
