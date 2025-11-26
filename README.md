# 📖 Line Bot 記帳小幫手 使用者指南

您的專屬 AI 智慧記帳助理，隨時隨地輕鬆紀錄每一筆開銷。

---

## 💸 專案簡介 (Overview)

「記帳小幫手」是您專屬的 Line 智慧型記帳機器人。它結合了 Next.js、Supabase 資料庫以及 **Google Gemini AI** 的強大能力，讓您只需在 Line 上傳送一句話，即可完成開銷紀錄、自動分類與數據查詢。

核心價值：**極低摩擦力 (Low Friction)** 的日常記帳體驗。

---

### 💡 核心功能特色

* **智能意圖判斷 (AI Intent):** Bot 能自動區分您的輸入是**「要記帳」**還是**「要查詢」**，不再需要輸入特定的指令前綴。
* **情境分類 (Smart Categorization):** AI 會根據您的文字敘述（例如提到「早餐」、「午餐」）或輸入時間點，自動將費用歸類，不需要手動指定。
* **數據查詢：** 隨時可透過指令快速回傳最近的消費紀錄。
* **持久儲存：** 所有紀錄安全地儲存在雲端資料庫中，供後續追蹤。

---

### 📲 操作指南 (How to Use)

#### 1. 新增一筆開銷 (Expense Entry)

Bot 會自動解析您的「品項」和「金額」。

| 動作 | 輸入範例 | AI 判斷結果 |
| :--- | :--- | :--- |
| **標準輸入** | `買了一杯拿鐵 135` | 意圖：Expense / 分類：其他 |
| **情境輸入** | `早上吃了火腿蛋餅55` | 意圖：Expense / 分類：早餐 |
| **手動指定分類** | `買遊戲王卡 1550 分類娛樂` | 意圖：Expense / 分類：娛樂 (Override) |

> **回覆：** 收到訊息後，Bot 會回傳 `✅ 記帳成功！` 並顯示解析後的品項、金額與分類。

#### 2. 查詢您的紀錄 (Retrieval Command)

當您需要查看最近的開銷時，可以輸入口語化的指令。

#### 3. 操作範例

![Example](Example.png)

---

### 🚫 限制與規範 (Rules)

* **配額提醒：** 測試時請適量使用。

---

### 📲 加入 Line Bot (Add Line Bot)

掃描以下 QR Code 或透過id @038yiysu，即可將「記帳小幫手」加為好友，立即開始您的智慧記帳體驗！

![Line Bot QR Code](line_bot_qr_code.png)

---
**馬上開始使用：** 請在 Line 聊天室中，輸入您的第一筆開銷吧！

使用上有問題請回報：[maxchao1217@gmail.com](mailto:maxchao1217@gmail.com)
---

# 📖 Line Bot 記帳小幫手 開發者紀錄

## 🏗️ 技術架構

### 技術棧

- **前端框架**: Next.js 14 (App Router)
- **開發語言**: TypeScript 5.0
- **聊天機器人 SDK**: @line/bot-sdk ^10.5.0
- **AI 模型**: Google Gemini 2.0 Flash Lite
- **資料庫**: Supabase (PostgreSQL)
- **圖表庫**: Recharts ^2.15.4
- **部署平台**: Vercel
- **運行環境**: Node.js >= 18.0.0

### 架構設計

```
┌─────────────────┐
│   LINE 使用者   │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐
│  /api/webhook   │ ← Next.js API Route
│  (route.ts)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Gemini │ │ Supabase │
│   AI   │ │ Database │
└────────┘ └──────────┘
         │
         ▼
┌─────────────────┐
│  /report/[id]   │ ← 個人報表頁面
│  /admin         │ ← 管理後台
└─────────────────┘
```

## 📁 專案結構

```
wphw6/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts          # LINE Webhook 處理邏輯
│   ├── admin/
│   │   └── page.tsx              # 管理後台（Server Component）
│   ├── report/
│   │   └── [id]/
│   │       └── page.tsx          # 個人報表頁面（Server Component）
│   └── layout.tsx                # 根布局
├── components/
│   └── ChartComponent.tsx       # 圓餅圖組件（Client Component）
├── .env.local                    # 環境變數（不提交）
├── vercel.json                   # Vercel 部署配置
├── tsconfig.json                 # TypeScript 配置（含路徑別名）
├── package.json                  # 專案依賴
└── README.md                      # 專案文檔
```

## 🔧 核心功能實現

### 1. LINE Webhook 處理 (`app/api/webhook/route.ts`)

**核心流程**:
1. 接收 LINE Webhook 請求
2. 驗證訊息類型（僅處理文字訊息）
3. 使用 Gemini AI 分析使用者意圖和提取資料
4. 根據意圖執行相應操作：
   - `expense`: 儲存記帳資料到 Supabase
   - `retrieval`: 回傳個人報表連結
   - `help`: 回傳功能說明
   - `other`: 回傳預設提示訊息
5. 回覆使用者訊息

**關鍵技術點**:
- 使用 `@line/bot-sdk` 處理 LINE 訊息
- Gemini AI 的 JSON 模式輸出，確保結構化回應
- 錯誤處理與優雅降級（API 錯誤、資料庫錯誤）

### 2. AI 意圖判斷與資料提取

**Prompt 設計**:
- 明確的意圖分類規則（expense / retrieval / help / other）
- 多層級的類別判斷邏輯：
  1. 使用者明確指定
  2. 關鍵字匹配（早餐、午餐等）
  3. 時間區間判斷
  4. 預設分類
- JSON 格式輸出，便於解析

**資料提取**:
```typescript
{
  intent: "expense" | "retrieval" | "help" | "other",
  item: string | null,
  amount: number | null,
  category: string | null
}
```

### 3. 個人報表頁面 (`app/report/[id]/page.tsx`)

**功能**:
- 顯示個人記帳紀錄
- 消費分類圓餅圖（使用 Recharts）
- 依類別篩選功能
- 總金額統計

**技術實現**:
- Server Component，資料在伺服器端獲取
- 使用 `searchParams` 實現 URL 參數篩選
- 資料聚合在伺服器端完成，減少客戶端負擔
- 整合 Client Component (`ChartComponent`) 用於圖表渲染

### 4. 管理後台 (`app/admin/page.tsx`)

**功能**:
- 查看所有使用者的記帳資料
- 依類別篩選
- 顯示原始輸入與 AI 解析結果對比

**技術實現**:
- Server Component，使用 `SUPABASE_SERVICE_ROLE_KEY` 獲取完整權限
- 動態類別列表生成
- 使用 `searchParams` 實現無狀態篩選

### 5. 圖表組件 (`components/ChartComponent.tsx`)

**功能**:
- 圓餅圖顯示消費分類占比
- 響應式設計，自適應不同螢幕尺寸
- 自訂顏色配置

**技術實現**:
- Client Component（`'use client'`），因為 Recharts 需要瀏覽器環境
- 使用 `ResponsiveContainer` 實現響應式
- 空資料處理

## 🚀 開發歷程

### Phase 1: 基礎架構
- ✅ 設置 Next.js 14 專案
- ✅ 配置 TypeScript 和路徑別名 (`@/*`)
- ✅ 整合 LINE Bot SDK
- ✅ 設置 Supabase 資料庫

### Phase 2: 核心功能
- ✅ 實作 LINE Webhook 處理
- ✅ 整合 Google Gemini AI
- ✅ 實作意圖判斷邏輯
- ✅ 實作記帳資料儲存

### Phase 3: 資料查詢
- ✅ 實作個人報表頁面
- ✅ 實作管理後台
- ✅ 實作類別篩選功能

### Phase 4: 視覺化
- ✅ 整合 Recharts 圖表庫
- ✅ 實作圓餅圖組件
- ✅ 優化 UI/UX

### Phase 5: 部署與優化
- ✅ 配置 Vercel 部署
- ✅ 設置環境變數
- ✅ 優化錯誤處理
- ✅ 添加功能說明（help intent）

## 🎯 技術決策

### 為什麼選擇 Next.js 14 App Router？

- **Server Components**: 減少客戶端 JavaScript，提升效能
- **API Routes**: 內建 API 端點支援，無需額外後端
- **自動優化**: 自動代碼分割、圖片優化等

### 為什麼使用 Server Components？

- **效能**: 資料獲取在伺服器端完成，減少客戶端負擔
- **安全性**: 敏感操作（資料庫查詢）在伺服器端執行
- **SEO**: 內容在伺服器端渲染，有利於搜尋引擎

### 為什麼選擇 Gemini 2.0 Flash Lite？

- **成本效益**: Flash Lite 模型成本較低
- **速度**: 回應速度快，適合即時互動
- **JSON 模式**: 支援結構化輸出，便於資料提取

### 為什麼使用 Supabase？

- **PostgreSQL**: 強大的關聯式資料庫
- **即時功能**: 未來可擴展即時更新功能
- **易於部署**: 無需自行管理資料庫伺服器

## 💻 本地開發環境設置

### 前置需求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0
- **Git**: 用於版本控制
- **LINE Developers 帳號**: 用於建立 Bot Channel
- **Google AI Studio 帳號**: 用於取得 Gemini API Key
- **Supabase 帳號**: 用於建立資料庫

### 步驟 1: 克隆專案

```bash
# 克隆專案到本地
git clone https://github.com/MaxChaohs/line-accounting-robot.git
cd line-accounting-robot

# 或使用 SSH
git clone git@github.com:MaxChaohs/line-accounting-robot.git
cd line-accounting-robot
```

### 步驟 2: 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 步驟 3: 設置環境變數

在專案根目錄創建 `.env.local` 檔案：

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Windows (CMD)
type nul > .env.local

# macOS / Linux
touch .env.local
```

然後在 `.env.local` 中填入以下環境變數：

```env
# LINE Bot 設定
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
CHANNEL_SECRET=your_line_channel_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase 設定
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### 如何取得環境變數

**LINE Bot 設定**:
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入並創建 Provider（如果還沒有）
3. 創建新的 Messaging API Channel
4. 在 Channel 設定頁面：
   - **Channel Access Token**: 點擊 "Issue" 按鈕生成
   - **Channel Secret**: 在 "Basic settings" 頁面查看

**Google Gemini API**:
1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用 Google 帳號登入
3. 點擊 "Create API Key"
4. 選擇或創建 Google Cloud 專案
5. 複製生成的 API Key

**Supabase 設定**:
1. 前往 [Supabase](https://supabase.com/)
2. 登入並創建新專案
3. 等待專案初始化完成（約 2 分鐘）
4. 在專案 Dashboard 中：
   - 前往 **Settings > API**
   - 複製 **Project URL**（`SUPABASE_URL`）
   - 複製 **service_role** 的 **Secret Key**（`SUPABASE_SERVICE_ROLE_KEY`）
   - ⚠️ **注意**: 請使用 `service_role` key，而非 `anon` key，因為需要完整資料庫權限

### 步驟 4: 設置資料庫

1. 在 Supabase Dashboard 中，前往 **SQL Editor**
2. 執行以下 SQL 創建資料表：

```sql
-- 創建 expenses 資料表
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  raw_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提升查詢效能
CREATE INDEX idx_user_id ON expenses(user_id);
CREATE INDEX idx_created_at ON expenses(created_at);

-- 驗證資料表是否創建成功
SELECT * FROM expenses LIMIT 1;
```

### 步驟 5: 啟動開發伺服器

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

開發伺服器將在 [http://localhost:3000](http://localhost:3000) 啟動。

### 步驟 6: 本地測試 Webhook（可選）

由於 LINE Webhook 需要 HTTPS，本地開發時需要使用隧道工具：

#### 使用 ngrok（推薦）

1. **安裝 ngrok**:
   ```bash
   # macOS (使用 Homebrew)
   brew install ngrok
   
   # 或前往 https://ngrok.com/download 下載
   ```

2. **啟動 ngrok 隧道**:
   ```bash
   # 在另一個終端視窗執行
   ngrok http 3000
   ```

3. **複製 HTTPS URL**:
   - ngrok 會顯示類似 `https://xxxx-xxxx-xxxx.ngrok.io` 的 URL
   - 複製此 URL

4. **設置 LINE Webhook**:
   - 前往 LINE Developers Console
   - 在 Channel 設定中找到 "Webhook settings"
   - 設置 Webhook URL: `https://xxxx-xxxx-xxxx.ngrok.io/api/webhook`
   - 點擊 "Verify" 驗證
   - 啟用 "Use webhook"

5. **測試**:
   - 在 LINE 中發送訊息給 Bot
   - 檢查終端視窗的日誌輸出
   - 檢查 Supabase 資料庫是否有新資料

#### 使用其他隧道工具

- **Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:3000`
- **localtunnel**: `npx localtunnel --port 3000`

## 🚀 部署到 Vercel

### 方法一：透過 GitHub 自動部署（推薦）

#### 步驟 1: 推送代碼到 GitHub

```bash
# 初始化 Git（如果還沒有）
git init

# 添加所有檔案
git add .

# 提交變更
git commit -m "Initial commit"

# 設置遠端倉庫（替換為你的 GitHub 倉庫 URL）
git remote add origin https://github.com/MaxChaohs/line-accounting-robot.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### 步驟 2: 在 Vercel 導入專案

1. 前往 [Vercel](https://vercel.com/)
2. 使用 GitHub 帳號登入
3. 點擊 **"Add New Project"**
4. 選擇你的 GitHub 倉庫 `line-accounting-robot`
5. Vercel 會自動檢測 Next.js 專案

#### 步驟 3: 設置環境變數

在 Vercel 專案設定中：

1. 前往 **Settings > Environment Variables**
2. 添加以下環境變數（與 `.env.local` 相同）：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `CHANNEL_ACCESS_TOKEN` | `your_line_channel_access_token` | LINE Bot Channel Access Token |
| `CHANNEL_SECRET` | `your_line_channel_secret` | LINE Bot Channel Secret |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini API Key |
| `SUPABASE_URL` | `your_supabase_url` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_service_role_key` | Supabase Service Role Key |

3. 為每個環境變數選擇適用的環境：
   - ✅ **Production**（生產環境）
   - ✅ **Preview**（預覽環境）
   - ✅ **Development**（開發環境，可選）

#### 步驟 4: 部署

1. 點擊 **"Deploy"** 按鈕
2. 等待建置完成（約 2-5 分鐘）
3. 部署成功後，記下部署網址（例如：`https://line-accounting-robot.vercel.app`）

#### 步驟 5: 設置 LINE Webhook

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. 在 **Messaging API** 設定中找到 **Webhook settings**
4. 設置 Webhook URL: `https://your-project.vercel.app/api/webhook`
5. 點擊 **"Verify"** 驗證 Webhook
6. 啟用 **"Use webhook"**

#### 步驟 6: 測試部署

1. 在 LINE 中發送訊息給 Bot
2. 檢查 Vercel 的 **Functions** 日誌確認是否有錯誤
3. 檢查 Supabase 資料庫確認資料是否正確儲存

### 方法二：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署到預覽環境
vercel

# 部署到生產環境
vercel --prod
```

#### 使用 CLI 設置環境變數

```bash
# 逐一添加環境變數
vercel env add CHANNEL_ACCESS_TOKEN
vercel env add CHANNEL_SECRET
vercel env add GEMINI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 或使用 .env 檔案批量導入（需要先創建 .env 檔案）
vercel env pull .env.local
```

### 部署後檢查清單

- [ ] 環境變數已正確設置
- [ ] 建置成功無錯誤
- [ ] LINE Webhook URL 已更新
- [ ] Webhook 驗證成功
- [ ] 測試記帳功能正常
- [ ] 測試查詢功能正常
- [ ] 檢查 Vercel 函數日誌無錯誤
- [ ] 檢查 Supabase 資料庫連線正常

## 🔐 環境變數配置

```env
# LINE Bot
CHANNEL_ACCESS_TOKEN=your_channel_access_token
CHANNEL_SECRET=your_channel_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

```

## 📊 資料庫結構

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,              -- LINE 使用者 ID
  item_name TEXT NOT NULL,            -- AI 解析的品項名稱
  amount NUMERIC(10, 2) NOT NULL,    -- 金額
  category TEXT NOT NULL,             -- AI 判斷的分類
  raw_text TEXT,                     -- 使用者原始輸入
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_id ON expenses(user_id);
CREATE INDEX idx_created_at ON expenses(created_at);
```

## 🐛 已知問題與解決方案

### 1. Gemini API 回傳陣列而非物件

**問題**: 有時 Gemini 會回傳 JSON 陣列而非單一物件

**解決方案**: 在解析時檢查是否為陣列，如果是則取第一個元素
```typescript
if (Array.isArray(parsedData)) {
  parsedData = parsedData.length > 0 ? parsedData[0] : null;
}
```

### 2. TypeScript 路徑別名解析錯誤

**問題**: `@/components/ChartComponent` 無法解析

**解決方案**: 在 `tsconfig.json` 中添加路徑配置
```json
"paths": {
  "@/*": ["./*"]
}
```

### 3. Client Component 在 Server Component 中使用

**問題**: Recharts 需要瀏覽器環境，無法在 Server Component 直接使用

**解決方案**: 創建獨立的 Client Component (`ChartComponent.tsx`)，標記 `'use client'`

## 🔮 未來改進方向

### 功能擴展
- [ ] 每日/每月消費統計
- [ ] 預算設定與提醒
- [ ] 多幣別支援
- [ ] 匯出功能（CSV/PDF）
- [ ] 消費趨勢分析（折線圖、柱狀圖）

### 技術優化
- [ ] 實作每日使用限制（成本控制）
- [ ] 添加快取機制（減少 API 呼叫）
- [ ] 實作錯誤監控（Sentry）
- [ ] 添加單元測試與整合測試
- [ ] 優化 AI Prompt（提升準確率）

### 使用者體驗
- [ ] 添加編輯/刪除記帳功能
- [ ] 實作分類自訂功能
- [ ] 添加多語言支援
- [ ] 優化行動裝置顯示

## 📝 開發注意事項

### 成本控制

⚠️ **重要**: Gemini API 有使用限制，建議實作每日使用限制：

```typescript
// 建議在 handleEvent 中添加
const DAILY_LIMIT = 10;
// 檢查使用者今日使用次數
```

### 安全性

- ✅ 使用環境變數儲存敏感資訊
- ✅ `.env.local` 已加入 `.gitignore`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 具有完整權限，請妥善保管
- ⚠️ 生產環境建議添加 Webhook 簽名驗證

## 📚 參考資源

- [Next.js 14 文檔](https://nextjs.org/docs)
- [LINE Bot SDK](https://github.com/line/line-bot-sdk-nodejs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [Recharts 文檔](https://recharts.org/)

---