/**
 * TTS (Text-to-Speech) 服务
 * 支持多种 TTS 提供商：Edge, Azure, 阿里云, 百度, 讯飞, CosyVoice
 */

import type {
  TTSProvider,
  TTSVoice,
  TTSConfig,
  TTSRequest,
  TTSResponse,
  TTSStreamChunk,
} from '@/core/types';
import { logger } from '@/core/utils/logger';
import { toast } from '@/shared/components/ui';

// 默认 TTS 配置
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  provider: 'edge',
  voice: 'zh-CN-XiaoxiaoNeural',
  speed: 1.0,
  pitch: 1.0,
  volume: 100,
  format: 'audio-24khz-48kbitrate-mono-mp3',
};

// 可用的音色列表
export const TTS_VOICES: Record<TTSProvider, TTSVoice[]> = {
  edge: [
    {
      id: 'zh-CN-XiaoxiaoNeural',
      name: '晓晓',
      gender: 'female',
      language: 'zh-CN',
      provider: 'edge',
      style: 'newscast',
    },
    {
      id: 'zh-CN-YunxiNeural',
      name: '云希',
      gender: 'male',
      language: 'zh-CN',
      provider: 'edge',
      style: 'newscast',
    },
    {
      id: 'zh-CN-YunyangNeural',
      name: '云扬',
      gender: 'male',
      language: 'zh-CN',
      provider: 'edge',
      style: 'newscast',
    },
    {
      id: 'zh-CN-XiaoyiNeural',
      name: '小艺',
      gender: 'female',
      language: 'zh-CN',
      provider: 'edge',
      style: 'affectionate',
    },
    {
      id: 'zh-CN-YunhaoNeural',
      name: '云浩',
      gender: 'male',
      language: 'zh-CN',
      provider: 'edge',
      style: 'advertisement',
    },
    {
      id: 'zh-CN-XiaoxuanNeural',
      name: '小璇',
      gender: 'female',
      language: 'zh-CN',
      provider: 'edge',
      style: 'customerservice',
    },
    {
      id: 'en-US-JennyNeural',
      name: 'Jenny',
      gender: 'female',
      language: 'en-US',
      provider: 'edge',
      style: 'newscast',
    },
    {
      id: 'en-US-GuyNeural',
      name: 'Guy',
      gender: 'male',
      language: 'en-US',
      provider: 'edge',
      style: 'newscast',
    },
  ],
  azure: [
    {
      id: 'zh-CN-XiaoxiaoAzureNeural',
      name: '晓晓',
      gender: 'female',
      language: 'zh-CN',
      provider: 'azure',
    },
    {
      id: 'zh-CN-YunxiAzureNeural',
      name: '云希',
      gender: 'male',
      language: 'zh-CN',
      provider: 'azure',
    },
    {
      id: 'en-US-JennyNeural',
      name: 'Jenny',
      gender: 'female',
      language: 'en-US',
      provider: 'azure',
    },
  ],
  aliyun: [
    { id: 'xiaoyun', name: '云小朵', gender: 'female', language: 'zh-CN', provider: 'aliyun' },
    { id: 'xiaogang', name: '阿钢', gender: 'male', language: 'zh-CN', provider: 'aliyun' },
    { id: 'ruoxi', name: '若曦', gender: 'female', language: 'zh-CN', provider: 'aliyun' },
  ],
  baidu: [
    { id: '0', name: '度小美', gender: 'female', language: 'zh-CN', provider: 'baidu' },
    { id: '1', name: '度小宇', gender: 'male', language: 'zh-CN', provider: 'baidu' },
    { id: '3', name: '度米朵', gender: 'female', language: 'zh-CN', provider: 'baidu' },
    { id: '4', name: '阿靖小宇', gender: 'male', language: 'zh-CN', provider: 'baidu' },
  ],
  iflytek: [
    { id: 'xiaoyan', name: '小燕', gender: 'female', language: 'zh-CN', provider: 'iflytek' },
    { id: 'xiaoyu', name: '小宇', gender: 'male', language: 'zh-CN', provider: 'iflytek' },
    {
      id: 'catherine',
      name: 'Catherine',
      gender: 'female',
      language: 'en-US',
      provider: 'iflytek',
    },
  ],
  cosyvoice: [
    {
      id: 'cosyvoice-v2-emo-female-na',
      name: 'Emo 女生',
      gender: 'female',
      language: 'zh-CN',
      provider: 'cosyvoice',
    },
    {
      id: 'cosyvoice-v2-emo-male-na',
      name: 'Emo 男生',
      gender: 'male',
      language: 'zh-CN',
      provider: 'cosyvoice',
    },
  ],
};

class TTSService {
  private abortControllers: Map<string, AbortController> = new Map();

  /**
   * 获取指定提供商的所有音色
   */
  getVoices(provider: TTSProvider): TTSVoice[] {
    return TTS_VOICES[provider] || [];
  }

  /**
   * 获取所有可用的音色
   */
  getAllVoices(): TTSVoice[] {
    return Object.values(TTS_VOICES).flat();
  }

  /**
   * 根据 ID 获取音色
   */
  getVoiceById(id: string): TTSVoice | undefined {
    return this.getAllVoices().find((v) => v.id === id);
  }

  /**
   * 生成语音
   */
  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const { text, config, signal } = request;

    if (!text || text.trim().length === 0) {
      throw new Error('文本内容不能为空');
    }

    switch (config.provider) {
      case 'edge':
        return this.edgeTTS(text, config, signal);
      case 'azure':
        return this.azureTTS(text, config, signal);
      case 'aliyun':
        return this.aliyunTTS(text, config, signal);
      case 'baidu':
        return this.baiduTTS(text, config, signal);
      case 'iflytek':
        return this.iflytekTTS(text, config, signal);
      case 'cosyvoice':
        return this.cosyvoiceTTS(text, config, signal);
      default:
        throw new Error(`不支持的 TTS 提供商: ${config.provider}`);
    }
  }

  /**
   * 流式生成语音
   */
  async *streamSynthesize(request: TTSRequest): AsyncGenerator<TTSStreamChunk> {
    const { text, config, signal } = request;

    if (!text || text.trim().length === 0) {
      throw new Error('文本内容不能为空');
    }

    // 目前仅 Edge 和 Azure 支持流式
    switch (config.provider) {
      case 'edge':
        yield* this.edgeTTSStream(text, config, signal);
        break;
      case 'azure':
        yield* this.azureTTSStream(text, config, signal);
        break;
      default: {
        // 其他提供商使用非流式
        const response = await this.synthesize(request);
        yield { audio: response.audio, isFinal: true };
      }
    }
  }

  /**
   * 取消指定请求
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Edge TTS
   */
  private async edgeTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    try {
      return await this.edgeTTSWebSocket(text, config, signal);
    } catch (wsError) {
      // WebSocket 失败时，降级到浏览器内置 SpeechSynthesis（预览场景）
      logger.warn('[TTS] Edge WebSocket 失败，尝试浏览器 SpeechSynthesis 降级:', wsError);
      try {
        return await this.browserSpeechFallback(text, config, signal);
      } catch {
        // 抛出原始错误，让调用方知道真实原因
        if (wsError instanceof DOMException && wsError.name === 'AbortError') {
          throw new Error('TTS 请求已取消');
        }
        throw wsError;
      }
    }
  }

  /**
   * Edge TTS WebSocket (使用 edge-tts-universal)
   */
  private async edgeTTSWebSocket(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    const { EdgeTTSBrowser } = await import('edge-tts-universal/browser');

    const rate = `${((config.speed - 1) * 100).toFixed(2)}%`;
    const volume = `${(config.volume - 100).toFixed(2)}%`;
    const pitch = `${((config.pitch - 1) * 100).toFixed(0)}Hz`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    const combinedSignal = signal
      ? combineAbortSignals(signal, abortController.signal)
      : abortController.signal;

    try {
      const tts = new EdgeTTSBrowser(text, config.voice, { rate, volume, pitch });
      const result = await Promise.race([
        tts.synthesize(),
        new Promise<never>((_, reject) => {
          combinedSignal.addEventListener('abort', () =>
            reject(new DOMException('TTS 请求已取消', 'AbortError'))
          );
        }),
      ]);

      clearTimeout(timeoutId);

      const audioBlob = result.audio;
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Edge TTS 返回了空的音频数据');
      }

      const audioBuffer = await audioBlob.arrayBuffer();

      return {
        audio: audioBuffer,
        duration: this.estimateDuration(text, config.speed),
        size: audioBuffer.byteLength,
        format: audioBlob.type || 'audio/mpeg',
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 浏览器 SpeechSynthesis 降级方案
   * 当 Edge TTS WebSocket 不可用时使用（如网络限制、非 Edge 浏览器）
   */
  private async browserSpeechFallback(
    text: string,
    config: TTSConfig,
    _signal?: AbortSignal
  ): Promise<TTSResponse> {
    if (!window.speechSynthesis) {
      throw new Error('浏览器不支持 SpeechSynthesis');
    }

    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioBuffer = await blob.arrayBuffer();
        resolve({
          audio: audioBuffer,
          duration: this.estimateDuration(text, config.speed),
          size: audioBuffer.byteLength,
          format: 'audio/webm',
        });
      };
      mediaRecorder.onerror = () => reject(new Error('浏览器 SpeechSynthesis 录音失败'));

      mediaRecorder.start();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.voice.startsWith('zh') ? 'zh-CN' : 'en-US';
      utterance.rate = config.speed;
      utterance.volume = config.volume / 100;

      // 匹配相近的音色
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find((v) => {
        if (config.voice.includes('Xiaoxiao') || config.voice.includes('female')) {
          return v.lang.startsWith('zh') && v.name.includes('Female');
        }
        if (config.voice.includes('Yunxi') || config.voice.includes('male')) {
          return v.lang.startsWith('zh') && v.name.includes('Male');
        }
        return v.lang.startsWith(config.voice.startsWith('zh') ? 'zh' : 'en');
      });
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onend = () => {
        mediaRecorder.stop();
        audioContext.close();
      };
      utterance.onerror = (e) => {
        mediaRecorder.stop();
        audioContext.close();
        reject(new Error(`浏览器语音合成失败: ${e.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Edge TTS 流式
   */
  private async *edgeTTSStream(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): AsyncGenerator<TTSStreamChunk> {
    // Edge TTS 目前不支持真正的流式，我们分段处理
    const maxCharsPerChunk = 500;
    const chunks = this.splitText(text, maxCharsPerChunk);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFinal = i === chunks.length - 1;

      const response = await this.edgeTTS(chunk, config, signal);

      yield {
        audio: response.audio,
        isFinal,
      };
    }
  }

  /**
   * Azure TTS
   */
  private async azureTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    // Azure TTS 需要 API Key，这里使用模拟实现
    toast.warning('Azure TTS 需要配置 API Key，当前使用 Edge TTS');
    return this.edgeTTS(text, config, signal);
  }

  /**
   * Azure TTS 流式
   */
  private async *azureTTSStream(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): AsyncGenerator<TTSStreamChunk> {
    yield* this.edgeTTSStream(text, config, signal);
  }

  /**
   * 阿里云 TTS
   */
  private async aliyunTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    // 阿里云 TTS 需要 API Key，这里使用模拟实现
    toast.warning('阿里云 TTS 需要配置 API Key，当前使用 Edge TTS');
    return this.edgeTTS(text, config, signal);
  }

  /**
   * 百度 TTS
   */
  private async baiduTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    // 百度 TTS 需要 API Key，这里使用模拟实现
    toast.warning('百度 TTS 需要配置 API Key，当前使用 Edge TTS');
    return this.edgeTTS(text, config, signal);
  }

  /**
   * 讯飞 TTS
   */
  private async iflytekTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    // 讯飞 TTS 需要 API Key，这里使用模拟实现
    toast.warning('讯飞 TTS 需要配置 API Key，当前使用 Edge TTS');
    return this.edgeTTS(text, config, signal);
  }

  /**
   * CosyVoice TTS
   */
  private async cosyvoiceTTS(
    text: string,
    config: TTSConfig,
    signal?: AbortSignal
  ): Promise<TTSResponse> {
    // CosyVoice 需要 API Key，这里使用模拟实现
    toast.warning('CosyVoice TTS 需要配置 API Key，当前使用 Edge TTS');
    return this.edgeTTS(text, config, signal);
  }

  /**
   * 保存音频到文件
   */
  async saveAudio(audio: ArrayBuffer, filename: string): Promise<void> {
    const blob = new Blob([audio], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 估算音频时长
   */
  private estimateDuration(text: string, speed: number): number {
    // 假设中文每字 0.3 秒，英文每词 0.2 秒
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

    const baseDuration = chineseChars * 0.3 + englishWords * 0.2;
    return baseDuration / speed;
  }

  /**
   * 转义 SSML 特殊字符
   */
  private escapeSSML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 分割文本为小块
   */
  private splitText(text: string, maxLength: number): string[] {
    const sentences = text.split(/([。！？.!?])/);
    const chunks: string[] = [];
    let current = '';

    for (const part of sentences) {
      if (current.length + part.length > maxLength) {
        if (current) {
          chunks.push(current);
          current = '';
        }
        // 如果单个句子超长，强制分割
        if (part.length > maxLength) {
          for (let i = 0; i < part.length; i += maxLength) {
            chunks.push(part.slice(i, i + maxLength));
          }
        } else {
          current = part;
        }
      } else {
        current += part;
      }
    }

    if (current) {
      chunks.push(current);
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

export const ttsService = new TTSService();
export default ttsService;

/**
 * 合并多个 AbortSignal，任一触发即中止
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
