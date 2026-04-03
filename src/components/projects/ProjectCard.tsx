import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, TrendingUp, ShieldCheck } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

const riskColors: Record<string, string> = {
  Low: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
};

const typeIcons: Record<string, string> = {
  Flood: '🌊',
  Drought: '☀️',
  Fire: '🔥',
  Earthquake: '🌍',
  Cyclone: '🌀',
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const progress = project.fiu_total > 0 ? (project.fiu_sold / project.fiu_total) * 100 : 0;

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="h-2 gradient-primary" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeIcons[project.type] || '🌍'}</span>
              <CardTitle className="font-display text-lg leading-tight">{project.title}</CardTitle>
            </div>
            {project.risk_score && (
              <Badge variant="outline" className={riskColors[project.risk_score]}>
                {project.risk_score} Risk
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" /> {project.location || 'Unknown'}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Budget</p>
              <p className="text-sm font-semibold font-display">₹{project.budget?.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-lg bg-muted p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ROI</p>
              <p className="text-sm font-semibold font-display flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" /> {project.roi}%
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>FIU Sold: {project.fiu_sold}/{project.fiu_total}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>AI Verified • ₹{project.price_per_fiu}/FIU</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
