import {
  Database,
  Receipt,
  ShoppingCart,
  Package,
  Warehouse,
  Cog,
  FileText,
  CreditCard,
  HandHelping,
  CircleCheck,
  BotMessageSquare,
  Lock
} from "lucide-react";

interface ModuleIconProps {
  icon: string;
  className?: string;
}

const ModuleIcon = ({ icon, className = "w-6 h-6" }: ModuleIconProps) => {
  const icons: Record<string, React.ReactNode> = {
    database: <Database className={className} />,
    receipt: <Receipt className={className} />,
    "shopping-cart": <ShoppingCart className={className} />,
    package: <Package className={className} />,
    warehouse: <Warehouse className={className} />,
    cog: <Cog className={className} />,
    "file-text": <FileText className={className} />,
    "credit-card": <CreditCard className={className} />,
    "hand-helping": <HandHelping className={className} />,
    "circle-check": <CircleCheck className={className} />,
    "bot-message-square": <BotMessageSquare className={className} />,
    lock: <Lock className={className} />
  };

  return icons[icon] || <Database className={className} />;
};

export default ModuleIcon;
