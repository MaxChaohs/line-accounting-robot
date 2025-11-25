// app/report/[id]/page.tsx

import { createClient } from '@supabase/supabase-js';
import { NextPage } from 'next';

// 🔴 關鍵設定：強制關閉快取，確保用戶每次查看的資料都是最新的
export const revalidate = 0; 

interface Expense {
  id: number;
  user_id: string;
  item_name: string;
  amount: number;
  category: string;
  created_at: string;
  raw_text?: string;
}

// 初始化 Supabase Client (與 Admin 頁面共用 Service Role Key)
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

async function getExpensesByUserId(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        // 🔴 關鍵篩選：強制篩選 user_id
        .eq('user_id', userId) 
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user expenses:", error);
        return [];
    }
    return data as Expense[];
}

const UserReportPage = async ({ 
    params,
}: { 
    params: { id: string } 
}) => {
    const userId = params.id;
    const expenses = await getExpensesByUserId(userId);

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>📊 個人記帳報表 (您的專屬紀錄)</h1>
            <p>您的使用者 ID Hash: <code>{userId}</code></p>
            <p>目前紀錄總數: **{expenses.length} 筆**。</p>

            {/* 這裡可以加上總金額計算等統計資訊 */}
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                {/* ... (省略表格的 THEAD 標題，請參考 /admin/page.tsx 的標題結構) ... */}
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={tableHeaderStyle}>日期/時間</th>
                        <th style={tableHeaderStyle}>原文輸入</th>
                        <th style={tableHeaderStyle}>品項 (LLM 解析)</th>
                        <th style={tableHeaderStyle}>金額 (NT$)</th>
                        <th style={tableHeaderStyle}>類別</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.length > 0 ? (
                        expenses.map((exp) => (
                            <tr key={exp.id}>
                                <td style={tableCellStyle}>{new Date(exp.created_at).toLocaleString('zh-TW')}</td>
                                <td style={{...tableCellStyle, maxWidth: '200px', overflowWrap: 'break-word'}}>{exp.raw_text}</td>
                                <td style={tableCellStyle}>{exp.item_name}</td>
                                <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold' }}>{exp.amount.toLocaleString()}</td>
                                <td style={tableCellStyle}>{exp.category}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{...tableCellStyle, textAlign: 'center', color: '#888'}}>
                                尚未有任何記帳紀錄。
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserReportPage;

// 基礎 CSS 樣式 (請將這些樣式定義在 page.tsx 底部)
const tableHeaderStyle: React.CSSProperties = { padding: '12px 10px', border: '1px solid #ddd', textAlign: 'left', borderBottom: '2px solid #ccc' };
const tableCellStyle: React.CSSProperties = { padding: '10px', border: '1px solid #eee' };