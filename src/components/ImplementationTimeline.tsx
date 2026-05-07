import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock, Rocket, CheckCircle2 } from "lucide-react";

const weeks4 = [
  {
    week: 1,
    title: "Base do sistema",
    description: "Cadastros + Fiscal",
    hours: "~4h",
    icon: "🏗️",
  },
  {
    week: 2,
    title: "Entrada de mercadoria",
    description: "Compras + Estoque",
    hours: "~4h",
    icon: "📦",
  },
  {
    week: 3,
    title: "Venda + Produção",
    description: "Venda + Produção",
    hours: "~4h",
    icon: "🛒",
  },
  {
    week: 4,
    title: "Financeiro + Serviços + CRM + Segurança",
    description: "Testes integrados + Preparação Go live",
    hours: "~4h",
    icon: "💰",
    goLive: true,
  },
];

const weeks8 = [
  {
    week: 1,
    title: "Base do sistema",
    description: "Cadastros básicos + Segurança",
    hours: "~2h",
    icon: "🏗️",
  },
  {
    week: 2,
    title: "Configurador",
    description: "Preços + Pagamentos",
    hours: "~2h",
    icon: "⚙️",
  },
  {
    week: 3,
    title: "Fiscal completo",
    description: "Configuração fiscal completa",
    hours: "~2h",
    icon: "📋",
  },
  {
    week: 4,
    title: "Compras + Estoque",
    description: "Entrada de mercadorias e controle",
    hours: "",
    icon: "📦",
  },
  {
    week: 5,
    title: "Vendas",
    description: "Módulo de vendas completo",
    hours: "",
    icon: "🛒",
  },
  {
    week: 6,
    title: "Produção",
    description: "Módulo de produção",
    hours: "",
    icon: "🏭",
  },
  {
    week: 7,
    title: "Financeiro + CRM",
    description: "Financeiro e relacionamento com cliente",
    hours: "",
    icon: "💰",
  },
  {
    week: 8,
    title: "Testes + Go Live",
    description: "Testes integrados + Preparação Go live",
    hours: "",
    icon: "🚀",
    goLive: true,
  },
];

const WeekCard = ({
  item,
  total,
}: {
  item: (typeof weeks4)[0];
  total: number;
}) => (
  <div className="relative group">
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-md ${
        item.goLive
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge
          variant={item.goLive ? "default" : "secondary"}
          className="text-xs"
        >
          Semana {item.week}/{total}
        </Badge>
        {item.hours && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {item.hours}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{item.icon}</span>
        <h4 className="font-semibold text-sm">{item.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground">{item.description}</p>
      {item.goLive && (
        <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Testes integrados + Go Live
        </div>
      )}
    </div>
  </div>
);

const ImplementationTimeline = () => {
  return (
    <Card className="relative z-10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Rocket className="w-5 h-5 text-primary" />
          Cronograma de Implantação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="4weeks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="4weeks" className="text-xs sm:text-sm">
              📅 4 Semanas (1 Mês)
            </TabsTrigger>
            <TabsTrigger value="8weeks" className="text-xs sm:text-sm">
              📅 8 Semanas (2 Meses)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="4weeks" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-base">
                🚀 Implantação Ágil e Estruturada
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Projeto intensivo com ~4h por semana
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {weeks4.map((item) => (
                <WeekCard key={item.week} item={item} total={4} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="8weeks" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-base">
                🎯 Implantação Confortável e Estruturada
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Projeto gradual com ritmo moderado
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {weeks8.map((item) => (
                <WeekCard key={item.week} item={item} total={8} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImplementationTimeline;
