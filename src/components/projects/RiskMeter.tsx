interface Props {
  score: string | null;
}

export const RiskMeter = ({ score }: Props) => {
  const levels = ['Low', 'Medium', 'High'];
  const activeIdx = levels.indexOf(score || 'Low');
  const colors = ['bg-success', 'bg-warning', 'bg-destructive'];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Risk Assessment</p>
      <div className="flex gap-1.5 items-end h-12">
        {levels.map((level, i) => (
          <div key={level} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t-sm transition-all ${i <= activeIdx ? colors[i] : 'bg-muted'}`}
              style={{ height: `${(i + 1) * 14}px` }}
            />
            <span className={`text-[10px] ${i === activeIdx ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
              {level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
