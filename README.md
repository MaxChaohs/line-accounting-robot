# LINE Bot 記帳助手

一個基於 LINE Bot 的智能記帳系統，使用 Google Gemini AI 進行自然語言處理，並將資料儲存至 Supabase 資料庫。

## 功能特色

- 🤖 **AI 智能解析**：使用 Google Gemini 2.0 Flash Lite 模型，自動從自然語言中提取記帳資訊
- 📝 **自動分類**：根據時間、關鍵字自動判斷消費類別（早餐、午餐、晚餐、宵夜等）
- 📊 **查詢功能**：支援查詢最近的記帳紀錄
- 🎯 **意圖識別**：智能判斷使用者意圖（記帳、查詢、其他）
- 💾 **資料持久化**：使用 Supabase 儲存所有記帳資料
- 🖥️ **管理後台**：提供網頁管理介面查看所有使用者的記帳資料

## 技術棧

- **前端框架**：Next.js 14 (App Router)
- **語言**：TypeScript
- **聊天機器人**：LINE Bot SDK
- **AI 模型**：Google Gemini 2.0 Flash Lite
- **資料庫**：Supabase (PostgreSQL)
- **部署**：Vercel (建議)

## 環境變數設置

在專案根目錄創建 `.env.local` 檔案，並設置以下環境變數：

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

### 如何取得環境變數

1. **LINE Bot 設定**
   - 前往 [LINE Developers Console](https://developers.line.biz/console/)
   - 創建 Provider 和 Channel
   - 取得 Channel Access Token 和 Channel Secret

2. **Google Gemini API**
   - 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 創建 API Key

3. **Supabase 設定**
   - 前往 [Supabase](https://supabase.com/)
   - 創建新專案
   - 在 Settings > API 中取得 Project URL 和 Service Role Key

## 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd wphw6
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設置環境變數**
   - 複製 `.env.local.example` 為 `.env.local`（如果有的話）
   - 填入所有必要的環境變數

4. **設置資料庫**
   
   在 Supabase SQL Editor 中執行以下 SQL 創建資料表：

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

## 使用說明

### LINE Bot 使用

1. 將 LINE Bot 加入好友
2. 發送記帳訊息，例如：
   - `買飲料 50`
   - `午餐 排骨飯 120`
   - `今天花多少`
   - `回傳我的紀錄`

3. Bot 會自動：
   - 解析訊息內容
   - 提取品項、金額、類別
   - 儲存至資料庫
   - 回覆確認訊息

### 管理後台

訪問 `/admin` 路徑查看管理後台：
- 查看所有使用者的記帳資料
- 依類別篩選
- 查看統計資訊

## 專案結構

```
wphw6/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts      # LINE Webhook 處理邏輯
│   ├── admin/
│   │   └── page.tsx          # 管理後台頁面
│   └── layout.tsx            # 根布局
├── .env.local                # 環境變數（不提交到 Git）
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API 端點

### POST `/api/webhook`

LINE Bot Webhook 端點，接收 LINE 平台發送的事件。

**請求格式**：LINE Webhook 標準格式

**回應格式**：
```json
{
  "status": "success"
}
```

## 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 執行 Lint 檢查
npm run lint
```

## 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com/) 導入專案
3. 設置環境變數
4. 部署完成後，在 LINE Developers Console 設置 Webhook URL：
   `https://your-domain.vercel.app/api/webhook`

### 其他平台

專案支援部署到任何支援 Next.js 的平台（如 Railway、Render 等）。

## 注意事項

- ⚠️ 確保 `.env.local` 檔案已加入 `.gitignore`，不要提交敏感資訊
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 具有完整資料庫權限，請妥善保管
- ⚠️ 建議在生產環境中設置 API 使用限制，避免成本過高
- ⚠️ LINE Webhook 需要 HTTPS，本地開發可使用 ngrok 等工具

## 授權

本專案僅供學習使用。

## 聯絡資訊

如有問題或建議，請聯繫專案維護者。

