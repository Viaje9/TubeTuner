# GitHub Actions CI/CD 設定

此目錄包含 TubeTuner 專案的 GitHub Actions 工作流程配置。

## 🔄 工作流程概覽

### 1. CI (`ci.yml`)
**觸發條件**: Push 到 main/develop 分支、Pull Request 到 main 分支

**功能**:
- 多版本 Node.js 測試 (20.x, 22.x)
- ESLint 程式碼檢查
- TypeScript 型別檢查
- Prettier 格式檢查
- 專案建置
- 依賴安全檢查 (僅限 PR)

### 2. 部署 (`deploy.yml`)
**觸發條件**: Push 到 main 分支、手動觸發

**功能**:
- 自動建置並部署到 GitHub Pages
- 程式碼品質檢查
- 自動設定 Pages 環境

### 3. 版本發布 (`release.yml`)
**觸發條件**: 推送版本標籤 (v*.*.*)

**功能**:
- 完整的程式碼檢查
- 建立發布壓縮檔 (tar.gz, zip)
- 自動產生 GitHub Release

### 4. 安全掃描 (`codeql.yml`)
**觸發條件**: Push/PR 到 main 分支、每週定期掃描

**功能**:
- CodeQL 安全分析
- 自動識別潛在安全漏洞

## 📋 使用說明

### 部署到 GitHub Pages
1. 確保 GitHub Pages 在 repository 設定中啟用
2. 設定來源為 "GitHub Actions"
3. Push 到 main 分支即可自動部署

### 發布新版本
```bash
# 建立版本標籤
git tag v1.0.0
git push origin v1.0.0
```

### 環境變數設定
- `VITE_BASE_PATH`: Vite 建置的基礎路徑（自動設定）
- `GITHUB_TOKEN`: GitHub 操作權杖（自動提供）

## ✅ 狀態徽章

將以下徽章加入主要 README：

```markdown
[![CI](https://github.com/Viaje9/TubeTuner/actions/workflows/ci.yml/badge.svg)](https://github.com/Viaje9/TubeTuner/actions/workflows/ci.yml)
[![Deploy](https://github.com/Viaje9/TubeTuner/actions/workflows/deploy.yml/badge.svg)](https://github.com/Viaje9/TubeTuner/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/Viaje9/TubeTuner/actions/workflows/codeql.yml/badge.svg)](https://github.com/Viaje9/TubeTuner/actions/workflows/codeql.yml)
```

## 🔧 本地測試

在推送前確保本地測試通過：

```bash
# 程式碼檢查
npm run lint
npm run type-check
npm run format:check

# 建置測試
npm run build
npm run preview
```