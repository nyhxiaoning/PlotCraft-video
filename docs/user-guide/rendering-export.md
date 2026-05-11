# 渲染与导出

从分镜和资产生成最终视频。

## 渲染步骤

```
故事板 → 图像生成 → 角色图片 → 口型同步 → 音频TTS → 合成 → 导出
```

### 图像生成

支持模型：Seedream 5.0（字节，推荐）· Kling 1.6（快手）· Vidu 2.0（生数）

### 口型同步

将角色唇部运动与音频同步：Wav2Lip · FaceRender

### TTS 语音

生成语音音频：Edge TTS（免费）· CosyVoice 2.0（阿里）· KAN-TTS（阿里）

## 导出格式

| 格式 | 扩展名  | 适用       |
| ---- | ------- | ---------- |
| MP4  | `.mp4`  | 通用兼容性 |
| WebM | `.webm` | 网络、透明 |
| MOV  | `.mov`  | 后期制作   |

### 质量预设

| 预设  | 分辨率    | 码率    |
| ----- | --------- | ------- |
| 720p  | 1280×720  | 5 Mbps  |
| 1080p | 1920×1080 | 10 Mbps |
| 4K    | 3840×2160 | 35 Mbps |

### 导出设置

```typescript
interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov';
  resolution: '720p' | '1080p' | '4K';
  fps: 24 | 30 | 60;
  quality: 'low' | 'medium' | 'high';
  includeSubtitles: boolean;
  includeAudio: boolean;
}
```

## 进度跟踪

流水线支持实时进度跟踪，可查看每个阶段的完成情况。
