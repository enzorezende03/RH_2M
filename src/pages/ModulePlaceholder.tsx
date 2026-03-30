import { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ModulePlaceholder({ title, description, icon: Icon }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Em desenvolvimento</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Este módulo está sendo construído. Em breve estará disponível com todas as funcionalidades.
        </p>
      </div>
    </div>
  );
}
