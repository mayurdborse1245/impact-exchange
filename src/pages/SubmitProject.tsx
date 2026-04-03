import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SubmitProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    type: 'Flood' as string,
    description: '',
    budget: '',
    expected_impact: '',
    fiu_total: '100',
    price_per_fiu: '100',
    project_duration: '12',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('projects').insert({
      owner_id: user.id,
      title: form.title,
      location: form.location,
      type: form.type,
      description: form.description,
      budget: parseFloat(form.budget) || 0,
      expected_impact: parseFloat(form.expected_impact) || 0,
      fiu_total: parseInt(form.fiu_total) || 100,
      price_per_fiu: parseFloat(form.price_per_fiu) || 100,
      project_duration: parseInt(form.project_duration) || 12,
    });

    setLoading(false);
    if (error) {
      toast.error('Failed to submit: ' + error.message);
    } else {
      toast.success('Project submitted for review!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Submit New Project</CardTitle>
          <CardDescription>Submit a disaster prevention project for review and funding</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Mumbai Flood Prevention System" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State" />
              </div>
              <div className="space-y-2">
                <Label>Disaster Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Flood', 'Drought', 'Fire', 'Earthquake', 'Cyclone'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe the project, its goals, and expected outcomes..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} required placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label>Expected Impact (₹ saved)</Label>
                <Input type="number" value={form.expected_impact} onChange={e => setForm(f => ({ ...f, expected_impact: e.target.value }))} placeholder="2000000" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total FIUs</Label>
                <Input type="number" value={form.fiu_total} onChange={e => setForm(f => ({ ...f, fiu_total: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Price per FIU (₹)</Label>
                <Input type="number" value={form.price_per_fiu} onChange={e => setForm(f => ({ ...f, price_per_fiu: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input type="number" value={form.project_duration} onChange={e => setForm(f => ({ ...f, project_duration: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitProject;
