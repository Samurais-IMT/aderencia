import { ADHERENCE_LABELS, IMPORTANCE_LABELS } from "@/types/adherence";

interface RatingSelectorProps {
  value: number;
  onChange: (value: number) => void;
  type: "adherence" | "importance";
}

const RatingSelector = ({ value, onChange, type }: RatingSelectorProps) => {
  const labels = type === "adherence" ? ADHERENCE_LABELS : IMPORTANCE_LABELS;

  return (
    <div className="grid grid-cols-5 gap-2">
      {labels.map((item) => {
        const isSelected = value === item.value;
        const colorClasses = {
          destructive: isSelected
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "border-destructive/30 hover:border-destructive hover:bg-destructive/10",
          warning: isSelected
            ? "bg-warning text-warning-foreground border-warning"
            : "border-warning/30 hover:border-warning hover:bg-warning/10",
          success: isSelected
            ? "bg-success text-success-foreground border-success"
            : "border-success/30 hover:border-success hover:bg-success/10",
          info: isSelected
            ? "bg-info text-info-foreground border-info"
            : "border-info/30 hover:border-info hover:bg-info/10",
          muted: isSelected
            ? "bg-muted text-muted-foreground border-border"
            : "border-muted hover:border-border hover:bg-muted/50"
        };

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              flex flex-col items-center justify-center gap-2
              ${colorClasses[item.color as keyof typeof colorClasses]}
              ${isSelected ? "scale-105 shadow-lg" : "hover:scale-102"}
            `}
          >
            <span className="text-2xl font-bold">{item.value}</span>
            <span className="text-xs text-center leading-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RatingSelector;
