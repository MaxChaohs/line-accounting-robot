// app/report/[id]/page.tsx

import { createClient } from '@supabase/supabase-js';
import { NextPage } from 'next';
// 🔴 引入 Client Component
import ChartComponent from '@/components/ChartComponent'; 


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

// 初始化 Supabase Client 
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 🔴 新增函數：只獲取該用戶使用過的分類，用於下拉選單 (保持不變)
async function getCategoriesForUser(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('category')
        .eq('user_id', userId); 

    if (error) {
        console.error("Error fetching user categories:", error);
        return [];
    }
    
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return uniqueCategories;
}

// 🔴 修改函數：接受 category 參數進行篩選 (保持不變)
async function getExpensesByUserId(userId: string, filterCategory: string): Promise<Expense[]> {
    let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId) 
        .order('created_at', { ascending: false });

    if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching user expenses:", error);
        return [];
    }
    return data as Expense[];
}

// Server Component (Page)
const UserReportPage = async ({ 
    params,
    searchParams, 
}: { 
    params: { id: string },
    searchParams: { category?: string } 
}) => {
    const userId = params.id;
    const filterCategory = searchParams.category || 'all'; 

    // 平行獲取資料：用戶的費用紀錄 和 用戶的類別列表
    const [expenses, categories] = await Promise.all([
        getExpensesByUserId(userId, filterCategory),
        getCategoriesForUser(userId)
    ]);
    
    // 🔴 數據聚合邏輯：計算每個分類的總金額 (Server-side calculation)
    const categoryTotals = expenses.reduce((acc, exp) => {
        const categoryKey = exp.category || '未分類';
        acc[categoryKey] = (acc[categoryKey] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    // 將聚合結果轉換為適合圖表使用的陣列格式
    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
    }));
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString();

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>📊 個人記帳報表</h1>
            <p>您的使用者 ID Hash: <code>{userId}</code></p>
            <p>目前紀錄總數: **{expenses.length} 筆**。**總金額:** NT$ {totalAmount}</p>

            {/* 🔴 圓餅圖區域 */}
            <h2 style={{marginTop: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>消費分類圓餅圖</h2>
            <ChartComponent data={chartData} /> 
            {/* 🔴 圓餅圖區域結束 */}

            <h2 style={{marginTop: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>明細列表</h2>

            {/* 篩選表單：使用 form method="GET" 自動更新 URL 參數 */}
            <form method="GET" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label htmlFor="category">依類別篩選:</label>
                <select 
                    name="category" 
                    id="category" 
                    defaultValue={filterCategory}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="all">所有類別</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <button 
                    type="submit"
                    style={{ padding: '8px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    篩選
                </button>
            </form>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
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
                                    <td style={tableCellStyle}>{new Date(exp.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</td>
                                    <td style={{...tableCellStyle, maxWidth: '200px', overflowWrap: 'break-word'}}>{exp.raw_text}</td>
                                    <td style={tableCellStyle}>{exp.item_name}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold' }}>{exp.amount.toLocaleString()}</td>
                                    <td style={tableCellStyle}>{exp.category}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{...tableCellStyle, textAlign: 'center', color: '#888'}}>
                                    尚未有任何 {filterCategory === 'all' ? '' : `"${filterCategory}"`} 紀錄。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserReportPage;

// 基礎 CSS 樣式
const tableHeaderStyle: React.CSSProperties = { padding: '12px 10px', border: '1px solid #ddd', textAlign: 'left', borderBottom: '2px solid #ccc' };
const tableCellStyle: React.CSSProperties = { padding: '10px', border: '1px solid #eee' };