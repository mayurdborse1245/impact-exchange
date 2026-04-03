import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, FolderKanban, BarChart3, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

const Admin = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<(Profile & { roles: AppRole[] })[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [projRes, userRes, roleRes, invRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('investments').select('*, projects(title, type)').order('created_at', { ascending: false }),
    ]);
    setProjects(projRes.data || []);
    const rolesMap: Record<string, AppRole[]> = {};
    (roleRes.data || []).forEach(r => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });
    setUsers((userRes.data || []).map(u => ({ ...u, roles: rolesMap[u.id] || [] })));
    setInvestments(invRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateProjectStatus = async (projectId: string, status: string) => {
    const { error } = await supabase.from('projects').update({ status }).eq('id', projectId);
    if (error) toast.error(error.message);
    else { toast.success(`Project ${status.toLowerCase()}`); fetchData(); }
  };

  const updateRiskScore = async (projectId: string, risk_score: string) => {
    const { error } = await supabase.from('projects').update({ risk_score }).eq('id', projectId);
    if (error) toast.error(error.message);
    else { toast.success('Risk score updated'); fetchData(); }
  };

  const updateROI = async (projectId: string, roi: string) => {
    const val = parseFloat(roi);
    if (isNaN(val)) return;
    const { error } = await supabase.from('projects').update({ roi: val }).eq('id', projectId);
    if (error) toast.error(error.message);
    else { toast.success('ROI updated'); fetchData(); }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
    if (error) toast.error(error.message);
    else { toast.success('Role assigned'); fetchData(); }
  };

  const totalRevenue = investments.reduce((s, i) => s + (i.amount || 0), 0);
  const pendingProjects = projects.filter(p => p.status === 'Pending').length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage platform operations</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary' },
          { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-info' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-success' },
          { label: 'Pending Approval', value: pendingProjects, icon: AlertTriangle, color: 'text-warning' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="alerts">Fraud Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader><CardTitle className="font-display">All Projects</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 font-medium">Title</th>
                      <th className="text-left py-3 font-medium">Type</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Risk</th>
                      <th className="text-right py-3 font-medium">ROI</th>
                      <th className="text-right py-3 font-medium">Budget</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-medium">{p.title}</td>
                        <td className="py-3">{p.type}</td>
                        <td className="py-3">
                          <Badge variant={p.status === 'Approved' ? 'default' : p.status === 'Rejected' ? 'destructive' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Select value={p.risk_score || ''} onValueChange={v => updateRiskScore(p.id, v)}>
                            <SelectTrigger className="w-24 h-8"><SelectValue placeholder="Set" /></SelectTrigger>
                            <SelectContent>
                              {['Low', 'Medium', 'High'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 text-right">
                          <input
                            type="number"
                            className="w-16 text-right bg-transparent border-b border-border text-sm"
                            defaultValue={p.roi || 0}
                            onBlur={e => updateROI(p.id, e.target.value)}
                          />%
                        </td>
                        <td className="py-3 text-right">₹{p.budget?.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right space-x-1">
                          {p.status === 'Pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => updateProjectStatus(p.id, 'Approved')}>
                                <CheckCircle className="w-4 h-4 text-success" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => updateProjectStatus(p.id, 'Rejected')}>
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="font-display">All Users</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 font-medium">Username</th>
                      <th className="text-left py-3 font-medium">Email</th>
                      <th className="text-left py-3 font-medium">Roles</th>
                      <th className="text-right py-3 font-medium">Wallet</th>
                      <th className="text-right py-3 font-medium">Assign Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-medium">{u.username}</td>
                        <td className="py-3 text-muted-foreground">{u.email}</td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">{u.roles.map(r => <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>)}</div>
                        </td>
                        <td className="py-3 text-right">₹{u.wallet_balance?.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right">
                          <Select onValueChange={v => assignRole(u.id, v as AppRole)}>
                            <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Add role" /></SelectTrigger>
                            <SelectContent>
                              {(['investor', 'project_submitter', 'admin'] as AppRole[]).map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments">
          <Card>
            <CardHeader><CardTitle className="font-display">All Investments</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 font-medium">Project</th>
                      <th className="text-left py-3 font-medium">Type</th>
                      <th className="text-right py-3 font-medium">FIUs</th>
                      <th className="text-right py-3 font-medium">Amount</th>
                      <th className="text-right py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(i => (
                      <tr key={i.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 font-medium">{(i.projects as any)?.title}</td>
                        <td className="py-3">{(i.projects as any)?.type}</td>
                        <td className="py-3 text-right">{i.fiu_count}</td>
                        <td className="py-3 text-right">₹{i.amount?.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader><CardTitle className="font-display">Fraud Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { msg: 'Unusual investment pattern detected from user #4821', severity: 'High' },
                { msg: 'Multiple rapid investments from same IP address', severity: 'Medium' },
                { msg: 'Project budget modification attempt blocked', severity: 'Low' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${a.severity === 'High' ? 'text-destructive' : a.severity === 'Medium' ? 'text-warning' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="text-sm">{a.msg}</p>
                  </div>
                  <Badge variant={a.severity === 'High' ? 'destructive' : 'secondary'}>{a.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
