import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['hsl(152,60%,42%)', 'hsl(38,92%,50%)', 'hsl(220,70%,55%)', 'hsl(0,72%,51%)', 'hsl(280,60%,55%)'];

const Portfolio = () => {
  const { user, profile } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('investments').select('*, projects(title, type, roi, status, risk_score)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setInvestments(data || []); setLoading(false); });
  }, [user]);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const expectedReturns = investments.reduce((s, i) => s + i.amount * (1 + ((i.projects as any)?.roi || 15) / 100), 0);
  const profit = expectedReturns - totalInvested;

  const byType: Record<string, number> = {};
  investments.forEach(i => {
    const type = (i.projects as any)?.type || 'Other';
    byType[type] = (byType[type] || 0) + i.amount;
  });
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }));

  const barData = investments.slice(0, 8).map(i => ({
    name: ((i.projects as any)?.title || 'Unknown').substring(0, 15),
    invested: i.amount,
    returns: i.amount * (1 + ((i.projects as any)?.roi || 15) / 100),
  }));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-2">My Portfolio</h1>
      <p className="text-muted-foreground mb-8">Track your disaster prevention investments</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-3xl font-display font-bold text-info">₹{totalInvested.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Expected Returns</p>
            <p className="text-3xl font-display font-bold text-success">₹{expectedReturns.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Expected Profit</p>
            <p className="text-3xl font-display font-bold text-primary">₹{profit.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="font-display">Investment by Type</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No investments yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display">Investment vs Returns</CardTitle></CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="invested" fill="hsl(220,70%,55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returns" fill="hsl(152,60%,42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No investments yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display">Investment History</CardTitle></CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No investments yet. Browse projects to start investing!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 font-medium">Project</th>
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-right py-3 font-medium">FIUs</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                    <th className="text-right py-3 font-medium">Expected Return</th>
                    <th className="text-right py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium">{(inv.projects as any)?.title || 'Unknown'}</td>
                      <td className="py-3">{(inv.projects as any)?.type}</td>
                      <td className="py-3 text-right">{inv.fiu_count}</td>
                      <td className="py-3 text-right">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-success">₹{(inv.amount * (1 + ((inv.projects as any)?.roi || 15) / 100)).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
