# LINE Bot 智能記帳助手

一個基於 LINE Bot 的智能記帳系統，使用 Google Gemini AI 進行自然語言處理，並將資料儲存至 Supabase 資料庫。支援自動分類、意圖識別和資料查詢功能。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 📋 目錄

- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [快速開始](#快速開始)
- [環境變數設置](#環境變數設置)
- [資料庫設置](#資料庫設置)
- [使用說明](#使用說明)
- [專案結構](#專案結構)
- [API 文檔](#api-文檔)
- [部署指南](#部署指南)
- [故障排除](#故障排除)
- [注意事項](#注意事項)

## ✨ 功能特色

- 🤖 **AI 智能解析**：使用 Google Gemini 2.0 Flash Lite 模型，自動從自然語言中提取記帳資訊
- 📝 **自動分類**：根據時間、關鍵字自動判斷消費類別（早餐、午餐、晚餐、宵夜、交通、日用等）
- 📊 **查詢功能**：支援查詢最近的記帳紀錄
- 🎯 **意圖識別**：智能判斷使用者意圖（記帳、查詢、其他）
- 💾 **資料持久化**：使用 Supabase PostgreSQL 儲存所有記帳資料
- 🖥️ **管理後台**：提供網頁管理介面查看所有使用者的記帳資料
- 🔍 **類別篩選**：管理後台支援依類別篩選查看紀錄

## 🛠 技術棧

- **前端框架**：Next.js 14 (App Router)
- **開發語言**：TypeScript 5.0
- **聊天機器人**：LINE Bot SDK (@line/bot-sdk)
- **AI 模型**：Google Gemini 2.0 Flash Lite
- **資料庫**：Supabase (PostgreSQL)
- **部署平台**：Vercel
- **運行環境**：Node.js >= 18.0.0

## 🚀 快速開始

### 前置需求

- Node.js >= 18.0.0
- npm 或 yarn
- LINE Developers 帳號
- Google AI Studio 帳號
- Supabase 帳號

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/MaxChaohs/line-accounting-robot.git
   cd line-accounting-robot
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設置環境變數**
   
   在專案根目錄創建 `.env.local` 檔案：
   ```env
   CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   CHANNEL_SECRET=your_line_channel_secret
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **設置資料庫**
   
   在 Supabase SQL Editor 中執行以下 SQL：
   ```sql
   CREATE TABLE expenses (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL,
     item_name TEXT NOT NULL,
     amount NUMERIC(10, 2) NOT NULL,
     category TEXT NOT NULL,
     raw_text TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE INDEX idx_user_id ON expenses(user_id);
   CREATE INDEX idx_created_at ON expenses(created_at);
   ```

5. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   
   應用程式將在 [http://localhost:3000](http://localhost:3000) 運行

## 🔐 環境變數設置

### 如何取得環境變數

#### 1. LINE Bot 設定

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 創建 Provider（如果還沒有）
3. 創建 Messaging API Channel
4. 在 Channel 設定頁面取得：
   - **Channel Access Token**：用於發送訊息
   - **Channel Secret**：用於驗證 Webhook 請求

#### 2. Google Gemini API

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登入 Google 帳號
3. 點擊 "Create API Key"
4. 複製產生的 API Key

#### 3. Supabase 設定

1. 前往 [Supabase](https://supabase.com/)
2. 創建新專案
3. 在 **Settings > API** 中取得：
   - **Project URL**：專案的 API URL
   - **Service Role Key**：具有完整資料庫權限的密鑰（⚠️ 請妥善保管）

## 💾 資料庫設置

### 資料表結構

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,                    -- 自動遞增主鍵
  user_id TEXT NOT NULL,                    -- LINE 使用者 ID
  item_name TEXT NOT NULL,                  -- 品項名稱（AI 解析）
  amount NUMERIC(10, 2) NOT NULL,           -- 金額
  category TEXT NOT NULL,                   -- 類別（AI 判斷）
  raw_text TEXT,                            -- 使用者原始輸入
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 建立時間
);
```

### 索引

- `idx_user_id`：加速依使用者查詢
- `idx_created_at`：加速依時間排序

## 📱 使用說明

### LINE Bot 使用

1. **加入好友**
   - 在 LINE Developers Console 中啟用 Webhook
   - 將 Bot 加入為好友

2. **記帳範例**
   ```
   買飲料 50
   午餐 排骨飯 120
   早餐 三明治 45
   加油 800
   買衛生紙 150
   ```

3. **查詢範例**
   ```
   回傳我的紀錄
   今天花多少
   查看最近的紀錄
   ```

4. **Bot 回應**
   - 記帳成功時會顯示：品項、金額、類別
   - 查詢時會顯示最近 5 筆紀錄
   - 無法理解時會提示使用方式

### 管理後台

訪問 `/admin` 路徑查看管理後台：

- **查看所有紀錄**：顯示所有使用者的記帳資料
- **類別篩選**：可依類別篩選查看特定類別的紀錄
- **資料統計**：顯示目前紀錄總數

## 📁 專案結構

```
line-accounting-robot/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts          # LINE Webhook 處理邏輯
│   ├── admin/
│   │   └── page.tsx              # 管理後台頁面
│   └── layout.tsx                # 根布局
├── .env.local                    # 環境變數（不提交到 Git）
├── .gitignore                    # Git 忽略檔案
├── vercel.json                   # Vercel 部署配置
├── package.json                  # 專案依賴和腳本
├── tsconfig.json                 # TypeScript 配置
└── README.md                     # 專案說明文件
```

## 📡 API 文檔

### POST `/api/webhook`

LINE Bot Webhook 端點，接收 LINE 平台發送的事件。

**請求格式**：LINE Webhook 標準格式

**回應格式**：
```json
{
  "status": "success"
}
```

**處理流程**：
1. 驗證 Webhook 請求
2. 解析使用者訊息
3. 使用 Gemini AI 分析意圖和提取資料
4. 根據意圖執行相應操作（記帳或查詢）
5. 回覆使用者訊息

## 🚢 部署指南

### Vercel 部署

#### 方法一：透過 GitHub 自動部署（推薦）

1. **推送代碼到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/MaxChaohs/line-accounting-robot.git
   git push -u origin main
   ```

2. **在 Vercel 導入專案**
   - 前往 [Vercel](https://vercel.com/)
   - 點擊 "Add New Project"
   - 選擇你的 GitHub 倉庫
   - Vercel 會自動檢測 Next.js 專案

3. **設置環境變數**
   - 在專案設定中進入 "Environment Variables"
   - 添加以下環境變數：
     - `CHANNEL_ACCESS_TOKEN`
     - `CHANNEL_SECRET`
     - `GEMINI_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. **部署**
   - 點擊 "Deploy"
   - 等待部署完成
   - 記下部署後的網址（例如：`https://your-project.vercel.app`）

5. **設置 LINE Webhook**
   - 前往 LINE Developers Console
   - 在 Channel 設定中找到 "Webhook settings"
   - 設置 Webhook URL：`https://your-project.vercel.app/api/webhook`
   - 點擊 "Verify" 驗證 Webhook
   - 啟用 "Use webhook"

#### 方法二：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel

# 設置環境變數
vercel env add CHANNEL_ACCESS_TOKEN
vercel env add CHANNEL_SECRET
vercel env add GEMINI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 其他部署平台

專案支援部署到任何支援 Next.js 的平台：

- **Railway**：支援自動部署，設置環境變數即可
- **Render**：支援自動部署，需要設置環境變數
- **AWS Amplify**：支援 Next.js，需要設置環境變數
- **自架伺服器**：使用 `npm run build` 和 `npm start`

## 🔧 開發指令

```bash
# 開發模式（熱重載）
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 執行 Lint 檢查
npm run lint
```

## 🐛 故障排除

### 常見問題

#### 1. Webhook 驗證失敗

**問題**：LINE Developers Console 顯示 Webhook 驗證失敗

**解決方案**：
- 確認 Webhook URL 正確（必須是 HTTPS）
- 確認環境變數 `CHANNEL_SECRET` 已正確設置
- 檢查 Vercel 部署是否成功
- 查看 Vercel 函數日誌確認錯誤訊息

#### 2. Gemini API 錯誤

**問題**：Bot 回應 "記帳 AI 暫時忙碌中"

**解決方案**：
- 檢查 `GEMINI_API_KEY` 是否正確
- 確認 API Key 未超過使用限制
- 檢查 Google AI Studio 中的 API 配額

#### 3. 資料庫連線錯誤

**問題**：Bot 回應 "資料庫連線異常"

**解決方案**：
- 確認 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 正確
- 檢查 Supabase 專案是否正常運行
- 確認資料表 `expenses` 已正確創建
- 檢查 Supabase 專案的網路設定

#### 4. 本地開發 Webhook 測試

**問題**：本地開發時無法接收 LINE Webhook

**解決方案**：
- 使用 ngrok 建立 HTTPS 隧道：
  ```bash
  ngrok http 3000
  ```
- 將 ngrok 提供的 URL 設置為 LINE Webhook URL
- 注意：每次重啟 ngrok 會產生新的 URL

#### 5. 建置錯誤

**問題**：`npm run build` 失敗

**解決方案**：
- 確認所有依賴已安裝：`npm install`
- 檢查 TypeScript 錯誤：`npm run lint`
- 確認環境變數在 `.env.local` 中已設置（建置時不需要，但運行時需要）

## ⚠️ 注意事項

### 安全性

- ⚠️ **環境變數**：確保 `.env.local` 檔案已加入 `.gitignore`，不要提交敏感資訊到 Git
- ⚠️ **Service Role Key**：`SUPABASE_SERVICE_ROLE_KEY` 具有完整資料庫權限，請妥善保管，不要洩露
- ⚠️ **API 限制**：建議在生產環境中設置 API 使用限制，避免成本過高
- ⚠️ **HTTPS**：LINE Webhook 需要 HTTPS，本地開發可使用 ngrok 等工具

### 成本控制

- Google Gemini API 有免費配額，超過後會收費
- 建議實作每日使用限制（程式碼中有註解提示）
- 監控 API 使用量，避免意外超支

### 最佳實踐

- 定期備份 Supabase 資料庫
- 監控 Vercel 函數執行時間和錯誤率
- 設置錯誤通知（可整合 Sentry 等服務）
- 定期更新依賴套件以修復安全漏洞

## 📄 授權

本專案僅供學習使用。

## 📞 聯絡資訊

如有問題或建議，請聯繫專案維護者或提交 Issue。

---

**專案連結**：[GitHub Repository](https://github.com/MaxChaohs/line-accounting-robot)
