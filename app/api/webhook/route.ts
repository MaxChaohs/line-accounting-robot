// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { messagingApi, webhook } from '@line/bot-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 1. 設定 Config (不變)
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN!;
const channelSecret = process.env.CHANNEL_SECRET!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Line Client
const client = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

// Gemini Client
const genAI = new GoogleGenerativeAI(geminiApiKey);


// 2. 定義 AI 處理邏輯 (統一意圖與資料提取)
async function analyzeTextWithGemini(text: string) {
    const currentTime = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        responseMimeType: "application/json", 
      },
    });
  
    const prompt = `
      你是一個具備記帳功能的智能助理。當前時間：${currentTime}。
      使用者輸入："${text}"

      請根據輸入內容判斷「意圖 (intent)」並提取所需資料。
  
      意圖分類 (intent)：
      - 'expense': 如果使用者輸入的是一筆費用紀錄 (包含金額和品項)。
      - 'retrieval': 如果使用者要求查看、總結或回傳紀錄 (例如：回傳我的紀錄、今天花多少)。
      - 'other': 如果是問候、無關緊要或無法判斷的輸入。

      費用資料提取規則：
      - 僅在 intent 為 'expense' 時才需提取 item, amount, category。
      - 類別判斷規則不變 (時間判斷、關鍵字關聯等)。

      請回傳統一的 JSON 格式：
      {"intent": "expense" | "retrieval" | "other", "item": "string | null", "amount": "number | null", "category": "string | null"}
      請確保 amount 始終為純數字或 null。
    `; // 🔴 PROMPT 更新：包含意圖判斷與範例

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        console.log("🤖 Gemini Raw Output:", responseText);
    
        // 1. 清理 Markdown 標記
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // 2. 解析 JSON
        let parsedData = JSON.parse(cleanText);
    
        // 關鍵修正：如果 AI 回傳的是陣列，我們只取第一個元素
        if (Array.isArray(parsedData)) {
          parsedData = parsedData.length > 0 ? parsedData[0] : null;
        }

        return parsedData;
    
      } catch (error) {
        console.error("❌ Gemini Parsing Error:", error);
        return null;
      }
  }


// 3. 處理單一事件 (新的意圖導向邏輯)
const handleEvent = async (event: webhook.Event) => {
    if (event.type !== 'message' || event.message.type !== 'text' || !event.source.userId) {
      // 確保是文字訊息，且有使用者 ID (Line 資訊)
      return;
    }
    
    // 🔴 取得使用者 ID
    const userId = event.source.userId;
    const userText = event.message.text;
    let replyText = '';
    
    // ⚠️ 這裡應該保留你之前實作的 DAILY_LIMIT 檢查邏輯，以控制成本！
    
    try {
      const result = await analyzeTextWithGemini(userText);
      const intent = result?.intent || 'other'; // 獲取 LLM 判斷的意圖

      // =========================================================
      // 🔴 意圖導向邏輯
      // =========================================================

      // A. 意圖判斷：retrieval (回傳紀錄)
      if (intent === 'retrieval') {
          const { data: records, error } = await supabase
              .from('expenses')
              .select('item_name, amount, category, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5); // 限制回傳最近 5 筆

          if (error || !records || records.length === 0) {
              replyText = "🔍 抱歉，找不到您最近的記帳紀錄。";
          } else {
              const summary = records.map(r => 
                  `\n- ${r.category}: ${r.item_name} $${r.amount}`
              ).join('');
              
              replyText = `📊 您最近的 ${records.length} 筆紀錄：${summary}`;
          }
      
      // B. 意圖判斷：expense (新增紀錄)
      } else if (intent === 'expense') {
          if (result && result.amount > 0) {
            // 寫入資料庫 (與原本邏輯相同)
            await supabase.from('expenses').insert({
                user_id: userId,
                item_name: result.item,
                amount: result.amount,
                category: result.category,
                raw_text: userText // 寫入原文
              });
            
            replyText = `✅ 記帳成功！已儲存到資料庫。\n\n📝 品項：${result.item}\n💰 金額：$${result.amount}\n📂 分類：${result.category}`;
            
          } else {
            // LLM 判斷為 expense 但無法提取金額
            replyText = `❓ LLM 判斷這是記帳需求，但找不到明確金額。請確認輸入格式喔！`;
          }
      
      // C. 意圖判斷：other (其他)
      } else {
           replyText = `👋 您好，請問您要新增一筆帳務紀錄 (例如: 買飲料 50)，還是要查詢最近的紀錄呢？`;
      }
    
    } catch (error) {
        console.error("❌ 系統錯誤:", error);
        
        const errorText = String(error);
    
        // 🔴 錯誤處理 (優雅降級)
        if (errorText.includes('Gemini') || errorText.includes('429')) {
          replyText = "🤖 記帳 AI 暫時忙碌中，請稍後再試！";
        } else if (errorText.includes('supabase') || errorText.includes('Database') || errorText.includes('NeonDbError')) {
          replyText = "💾 資料庫連線異常，您的帳務紀錄無法儲存！請稍後再試。";
        } else {
          replyText = "🚨 系統發生未知錯誤，請截圖聯繫管理員！";
        }
    }
  
    await client.replyMessage({
      replyToken: event.replyToken as string,
      messages: [{ type: 'text', text: replyText }],
    });
  };

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const bodyJson = JSON.parse(body);
    const events: webhook.Event[] = bodyJson.events;

    await Promise.all(events.map((event: webhook.Event) => handleEvent(event)));
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}