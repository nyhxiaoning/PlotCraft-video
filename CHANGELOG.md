# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-05-18

### ✨ AI Provider 配置与切换

- **AI Provider 设置页面**: 重写设置页 API 选项卡，使用 `MODEL_PROVIDERS` 配置中心数据源，支持 14 个 AI 提供商的密钥配置、连接测试、默认设置
- **顶部导航栏快速切换**: 新增全局 Header 组件，包含 AI Provider 下拉快速切换器，所有页面均可访问
- **打通设置与调用链路**: 新增 `getActiveModelConfig()` 工具，从 localStorage 读取用户首选提供商，并映射到对应模型
  - pipeline 剧本生成步骤默认模型从硬编码 `glm-5`/`zhipu` 改为读取活跃配置
  - ProjectEditPage 中硬编码的 `gpt-4`/`openai` 改为读取活跃配置
  - NovelService 中 4 处硬编码 `qwen-3.5`/`alibaba` 改为读取活跃配置
  - StoryboardService 中 1 处硬编码 `qwen-3.5`/`alibaba` 改为读取活跃配置
- **API Key 存储扩展**: 新增 google/alibaba/tencent/minimax/moonshot/kling/bytedance 等提供商的密钥安全存储支持
- 新增组件：`AiProviderSettings`、`AiProviderSwitcher`

### 🐛 修复

- **LESS 导入路径修复**: 修复 `src/features/*/components/` 下多个 `.module.less` 文件中错误的 `variables.less` 导入路径 (`../../styles/` → `../../../styles/`)

## [1.0.0] - 2026-05-07

### 🎉 Project Renamed

- **Project Name**: Nova → ManGaAI → **PanelFlow**
- New ASCII art logo
- Updated all documentation references
- GitHub: https://github.com/Agions/PanelFlow

### 🗑️ UI 组件库迁移

- **antd 完全移除**: 62 个 antd 组件引用 → 0
- **@ant-design/icons 完全移除**: 14 个引用 → 0
- **迁移至 shadcn/ui**: 基于 Radix UI + Tailwind CSS 的全新组件系统
- **CSS 清理**: 移除 197 行 antd 相关 CSS

### 🎉 Major Rebranding

- **Project Renamed**: ManGaAI → **PanelFlow**
- **Version Bump**: v2.1.0 → v1.0.0
- **Complete Rebrand**: New logo, brand identity, all configurations updated

### ✨ Workflow Engine

- **Step 6 Scene Rendering**: Complete implementation
- **Step 7 Dynamic Composition**: Camera movement system, Ken Burns effects, transitions
- **Step 8 Voiceover & BGM**: Dialogue collection, character voice mapping, ambient BGM
- **Step 9 Export**: Timeline orchestration, multi-track composition, export settings

### ✨ New Features

- Professional tool-style UI redesign
- Enhanced workflow system
- Improved code architecture

### 🔧 Configuration Updates

- Package name: `manga-ai` → `PanelFlow`
- Tauri identifier: `com.mangaai.app` → `com.PanelFlow.app`
- Window title updated to PanelFlow branding
- Storage key prefix updated to `PanelFlow_`

### ✨ Added

- **8-Step Drama Workflow**: Novel → Script → Storyboard → Character → Scene → Animation → Voiceover → Export
- **Novel Parser**: Automatic novel-to-script conversion with character extraction
- **Storyboard Generator**: AI-powered panel generation from script scenes
- **Character Consistency**: Character appearance and personality management
- **Drama Style System**: Genre/tone/pacing/art style management
- **Vision Service**: Advanced scene detection, object detection, emotion analysis
- **Novel Service**: Parse novels, convert to scripts, generate storyboards
- **Model Selector**: Smart AI model selection with cost estimation
- **Script Generator**: AI-powered script generation
- **Storyboard Generator**: Automatic storyboard creation
- **Character Designer**: AI character generation with consistency
- **Project Management**: Complete project lifecycle management
- **Storage Service**: Persistent local storage

### 📝 Documentation

- Complete README rewrite in English
- Added comprehensive project structure documentation
- Updated AI model support (2026 latest models)
- Mermaid tech architecture diagrams

### 🔧 Technical

- React 18 + TypeScript + Vite
- Shadcn UI + Framer Motion
- Tauri for desktop application
- Zustand for state management
- Modular architecture with service layer
- FFmpeg integration

### 🤖 LLM Models (2026 Latest)

- Baidu ERNIE 4.0
- Alibaba Qwen 2.5
- Moonshot Kimi K2.5
- Zhipu GLM-5
- MiniMax M2.5

## [0.1.0] - 2026-02-16

### Added

- Project initialization
- Basic project structure
- TypeScript configuration
- Development environment setup
