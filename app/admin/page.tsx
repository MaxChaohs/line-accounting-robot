// app/admin/page.tsx
import { createClient } from '@supabase/supabase-js';
import { NextPage } from 'next';

export const revalidate = 0;

// 1. 定義資料結構
interface Expense {
  id: number;
  user_id: string;
  item_name: string;
  amount: number;
  category: string;
  created_at: string;
  raw_text?: string;
}

// 2. 初始化 Supabase Client
// ⚠️ 注意：這裡必須使用 SUPABASE_SERVICE_ROLE_KEY，因為這是在伺服器端運行，需要完整權限來讀取所有使用者的資料。
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 3. 取得所有不重複的 Category，用於篩選下拉選單
async function getCategories(): Promise<string[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('category')
        .order('category', { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    
    // 從結果中提取不重複的 category
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return uniqueCategories;
}

// 4. 取得費用資料 (包含篩選邏輯)
async function getExpenses(filterCategory: string): Promise<Expense[]> {
    let query = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

    // 🔴 實作篩選邏輯：如果不是 'all'，則加入 WHERE 條件
    if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
    }
    
    const { data, error } = await query;

    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
    return data as Expense[];
}

// Server Component (Page): searchParams 會自動從 URL 讀取查詢參數
const AdminDashboard = async ({ 
    searchParams,
}: { 
    searchParams: { category?: string } 
}) => {
    // 獲取當前的篩選類別
    const filterCategory = searchParams.category || 'all';

    // 平行獲取資料
    const [expenses, categories] = await Promise.all([
        getExpenses(filterCategory),
        getCategories()
    ]);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>💸 Line Bot 記帳管理後台</h1>
            <p>目前已儲存 {expenses.length} 筆紀錄 (篩選: <b>{filterCategory === 'all' ? '全部' : filterCategory}</b>)。</p>

            {/* 篩選器：使用 form method="GET" 自動更新 URL 參數，實現 Server Component 互動性 */}
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
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>日期/時間</th>
                            <th style={tableHeaderStyle}>使用者 ID (Hash)</th>
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
                                    <td style={tableCellStyle}>{exp.id}</td>
                                    <td style={tableCellStyle}>{new Date(exp.created_at).toLocaleString('zh-TW')}</td>
                                    <td style={{...tableCellStyle, fontSize: '12px'}} title={exp.user_id}>{exp.user_id.substring(0, 10)}...</td>

                                    <td style={{...tableCellStyle, maxWidth: '200px', overflowWrap: 'break-word'}}>{exp.raw_text}</td>

                                    <td style={tableCellStyle}>{exp.item_name}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: 'bold' }}>{exp.amount.toLocaleString()}</td>
                                    <td style={tableCellStyle}>{exp.category}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{...tableCellStyle, textAlign: 'center', color: '#888'}}>
                                    目前沒有 {filterCategory === 'all' ? '任何' : `"${filterCategory}"`} 紀錄。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;

// 基礎 CSS 樣式
const tableHeaderStyle: React.CSSProperties = { padding: '12px 10px', border: '1px solid #ddd', textAlign: 'left', borderBottom: '2px solid #ccc' };
const tableCellStyle: React.CSSProperties = { padding: '10px', border: '1px solid #eee' };