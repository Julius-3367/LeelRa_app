import { FileText, Inbox, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "search" | "inbox" | "documents" | "users";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  search: Search,
  inbox: Inbox,
  documents: FileText,
  users: Users,
};

export function EmptyState({ 
  icon = "inbox", 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="min-w-[120px]">
          {action.label}
        </Button>
      )}
    </div>
  );
}
