import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

const Dashboard = () => {
  const { profile, roles } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);

  const isSubmitter = roles.includes('project_submitter');

  useEffect(() => {
    supabase.from('projects').select('*').eq('status', 'Approved').limit(6).order('created_at', { ascending: false })
      .then(({ data }) => setProjects(data || []));
  }, []);

  useEffect(() => {
    if (!profile) return;
    supabase.from('investments').select('amount, project_id, projects(roi)').eq('user_id', profile.id)
      .then(({ data }) => {
        if (!data) return;
        const invested = data.reduce((sum, i) => sum + (i.amount || 0), 0);
        setTotalInvested(invested);
        const returns = data.reduce((sum, i) => {
          const roi = (i.projects as any)?.roi || 15;
          return sum + (i.amount || 0) * (1 + roi / 100);
        }, 0);
        setTotalReturns(returns);
      });
  }, [profile]);

  const stats = [
    { label: 'Wallet Balance', value: `₹${profile?.wallet_balance?.toLocaleString('en-IN') || '0'}`, icon: Wallet, color: 'text-primary' },
    { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN')}`, icon: BarChart3, color: 'text-info' },
    { label: 'Expected Returns', value: `₹${totalReturns.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-success' },
    { label: 'Active Projects', value: projects.length.toString(), icon: Activity, color: 'text-warning' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Welcome, {profile?.username || 'Investor'}</h1>
        <p className="text-muted-foreground">
          {isSubmitter ? 'Manage your projects and track progress' : 'Your disaster prevention investment dashboard'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
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

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
