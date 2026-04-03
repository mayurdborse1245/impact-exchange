import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RiskMeter } from '@/components/projects/RiskMeter';
import { MapPin, TrendingUp, Clock, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [fiuCount, setFiuCount] = useState(1);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [investing, setInvesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isInvestor = roles.includes('investor');

  useEffect(() => {
    if (!id) return;
    supabase.from('projects').select('*').eq('id', id).single()
      .then(({ data }) => { setProject(data); setLoading(false); });
  }, [id]);

  const handleInvest = async () => {
    if (!project || !user || !profile) return;
    const amount = fiuCount * project.price_per_fiu;
    if (amount > profile.wallet_balance) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (fiuCount > project.fiu_total - project.fiu_sold) {
      toast.error('Not enough FIUs available');
      return;
    }

    setInvesting(true);
    const { error: invError } = await supabase.from('investments').insert({
      user_id: user.id,
      project_id: project.id,
      fiu_count: fiuCount,
      amount,
    });

    if (invError) {
      toast.error('Investment failed: ' + invError.message);
      setInvesting(false);
      return;
    }

    await supabase.from('profiles').update({ wallet_balance: profile.wallet_balance - amount }).eq('id', user.id);
    await supabase.from('projects').update({ fiu_sold: project.fiu_sold + fiuCount }).eq('id', project.id);

    await refreshProfile();
    setProject(p => p ? { ...p, fiu_sold: p.fiu_sold + fiuCount } : p);
    setShowDisclaimer(false);
    toast.success(`Successfully invested ₹${amount.toLocaleString('en-IN')}!`);
    setInvesting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Project not found</div>;

  const progress = project.fiu_total > 0 ? (project.fiu_sold / project.fiu_total) * 100 : 0;
  const available = project.fiu_total - project.fiu_sold;
  const investAmount = fiuCount * project.price_per_fiu;
  const expectedReturn = investAmount * (1 + (project.roi || 0) / 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="outline" className="text-sm">{project.type}</Badge>
                <Badge variant={project.status === 'Approved' ? 'default' : 'secondary'}>{project.status}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> AI Verified
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" /> {project.location}
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4" /> {project.project_duration} months
              </div>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          {/* Map placeholder */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-display font-semibold mb-3">Project Location</h3>
              <div className="h-48 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <MapPin className="w-8 h-8 mr-2" /> Map visualization – {project.location}
              </div>
            </CardContent>
          </Card>

          {/* Live monitoring placeholder */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-display font-semibold mb-3">Live Monitoring</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Water Level', value: '2.3m', trend: '↓' },
                  { label: 'Soil Moisture', value: '45%', trend: '↑' },
                  { label: 'Temperature', value: '28°C', trend: '→' },
                  { label: 'Satellite Feed', value: 'Active', trend: '✓' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-display font-bold">{s.value}</p>
                    <p className="text-xs text-primary">{s.trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Budget</p>
                  <p className="text-lg font-display font-bold">₹{project.budget?.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected ROI</p>
                  <p className="text-lg font-display font-bold text-success flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> {project.roi}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Impact Potential</p>
                <p className="text-lg font-display font-bold">₹{project.expected_impact?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">estimated savings from disaster prevention</p>
              </div>

              <RiskMeter score={project.risk_score} />

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Funding Progress</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{available} FIUs remaining at ₹{project.price_per_fiu}/FIU</p>
              </div>

              {isInvestor && project.status === 'Approved' && available > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={available}
                      value={fiuCount}
                      onChange={e => setFiuCount(Math.max(1, Math.min(available, parseInt(e.target.value) || 1)))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">FIUs</span>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-medium">₹{investAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Return</span>
                      <span className="font-medium text-success">₹{expectedReturn.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setShowDisclaimer(true)}>
                    Invest ₹{investAmount.toLocaleString('en-IN')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Escrow Protected</p>
                  <p className="text-xs text-muted-foreground">Funds are locked in escrow until project milestones are verified.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Risk Disclaimer</DialogTitle>
            <DialogDescription>Please read before investing</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>By proceeding, you acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This is a simulated investment platform for demonstration purposes.</li>
              <li>Returns are estimated and not guaranteed.</li>
              <li>Your funds will be locked in escrow until project completion.</li>
              <li>Risk scores are AI-generated and may not reflect actual risk.</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisclaimer(false)}>Cancel</Button>
            <Button onClick={handleInvest} disabled={investing}>
              {investing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
