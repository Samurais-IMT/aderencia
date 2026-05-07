export interface SubItem {
  id: string;
  name: string;
  importance: number;
  adherence: number;
  adherenceNote: string;
}

export interface Module {
  id: number;
  name: string;
  description: string;
  icon: string;
  willUse: boolean | null;
  subItems: SubItem[];
  adherence: number;
  importance: number;
  notes: string;
}

export interface ClientInfo {
  clientName: string;
  meetingDate: string;
  consultantName: string;
  collaboratorName: string;
  cnpjCount: number;
}

export interface Summary {
  overallAdherence: number;
  weightedImportance: number;
  modulesAttended: number;
  criticalNotAttended: Module[];
}

export interface FormData {
  client: ClientInfo;
  modules: Module[];
  summary: Summary;
}

export interface ModuleTemplate {
  id: number;
  name: string;
  description: string;
  icon: string;
  subItems: { id: string; name: string }[];
}

export const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: 1,
    name: "Cadastros Gerais",
    description: "Configurações base: Pessoas, Produtos, Fornecedores, Clientes",
    icon: "database",
    subItems: [
      { id: "1-1", name: "Clientes" },
      { id: "1-2", name: "Produtos e Serviços" },
      { id: "1-3", name: "Configurador de Produtos" },
      { id: "1-4", name: "Tabela de Preços" },
      { id: "1-5", name: "Condições de Pagamento" },
      { id: "1-6", name: "Formas de Pagamento" },
      { id: "1-7", name: "Fornecedores" }
    ]
  },
  {
    id: 2,
    name: "Configurações Fiscais",
    description: "Regras de ICMS, NCM, Natureza de Operação, Impostos",
    icon: "receipt",
    subItems: [
      { id: "2-1", name: "Regras de ICMS" },
      { id: "2-2", name: "Origem Fiscal" },
      { id: "2-3", name: "Tipo de Contribuinte" },
      { id: "2-4", name: "Classificação Fiscal/NCM" },
      { id: "2-5", name: "Classificação Tributária" },
      { id: "2-6", name: "Benefício Fiscal" },
      { id: "2-7", name: "NOP" }
    ]
  },
  {
    id: 3,
    name: "Compras",
    description: "Requisições, cotações, pedidos de compra, importação",
    icon: "package",
    subItems: [
      { id: "3-1", name: "Requisição de Compras" },
      { id: "3-2", name: "Mapa de Cotações" },
      { id: "3-3", name: "Pedido de Compra" },
      { id: "3-4", name: "Processo de Importação/DUIMP" },
      { id: "3-5", name: "Planejamento de Compras" },
      { id: "3-6", name: "Atualização de Custo" }
    ]
  },
  {
    id: 4,
    name: "Estoque",
    description: "Recebimento, separação, inventário, romaneio, depósitos",
    icon: "warehouse",
    subItems: [
      { id: "4-1", name: "Recebimento" },
      { id: "4-2", name: "Separação" },
      { id: "4-3", name: "Etiqueta de Preço" },
      { id: "4-4", name: "Inventário" },
      { id: "4-5", name: "Itens e Veículos" },
      { id: "4-6", name: "Painel de Importação NF-e" },
      { id: "4-7", name: "Romaneio de Entrega" },
      { id: "4-8", name: "Unidade de Armazenagem" },
      { id: "4-9", name: "Estoques em Terceiros" },
      { id: "4-10", name: "Depósitos" }
    ]
  },
  {
    id: 5,
    name: "Produção",
    description: "Estrutura de produtos, roteiros, linhas, ordens de produção",
    icon: "cog",
    subItems: [
      { id: "5-1", name: "Ordem de Produção" },
      { id: "5-2", name: "Planejamento" },
      { id: "5-3", name: "Cálculo de Custo PA" },
      { id: "5-4", name: "Estrutura de Produtos" },
      { id: "5-5", name: "Roteiro de Produção" },
      { id: "5-6", name: "Linha de Produção" }
    ]
  },
  {
    id: 6,
    name: "Vendas",
    description: "Pedidos, faturamento, NF-e, comissões, placar de vendas",
    icon: "shopping-cart",
    subItems: [
      { id: "6-1", name: "Pedidos" },
      { id: "6-2", name: "Faturamento (NF)" },
      { id: "6-3", name: "NF-e Federal" },
      { id: "6-4", name: "NF Complementar" },
      { id: "6-5", name: "Sigep" },
      { id: "6-6", name: "Painel NFS-e" },
      { id: "6-7", name: "Placar de Vendas" },
      { id: "6-8", name: "Comissões" }
    ]
  },
  {
    id: 7,
    name: "Financeiro",
    description: "Plano de contas, centro de custo, contas a receber/pagar, fluxo de caixa",
    icon: "credit-card",
    subItems: [
      { id: "7-1", name: "Plano de Contas" },
      { id: "7-2", name: "Centro de Custo" },
      { id: "7-3", name: "Contas a Receber" },
      { id: "7-4", name: "Contas a Pagar" },
      { id: "7-5", name: "Ebitidas" },
      { id: "7-6", name: "Orçamento" },
      { id: "7-7", name: "Fluxo de Caixa" }
    ]
  },
  {
    id: 8,
    name: "Serviços",
    description: "Plano de serviço, faturamento de plano, OS e assistência técnica",
    icon: "hand-helping",
    subItems: [
      { id: "8-1", name: "Plano de Serviço" },
      { id: "8-2", name: "Faturamento de Plano" },
      { id: "8-3", name: "OS - Assistência Técnica" }
    ]
  },
  {
    id: 9,
    name: "Ocorrências",
    description: "Gestão de ocorrências e placar SLA",
    icon: "circle-check",
    subItems: [
      { id: "9-1", name: "Ocorrências" },
      { id: "9-2", name: "Placar SLA" }
    ]
  },
  {
    id: 10,
    name: "Atendimento/CRM",
    description: "CRM, oportunidades, atendimento ao cliente",
    icon: "bot-message-square",
    subItems: [
      { id: "10-1", name: "CRM" },
      { id: "10-2", name: "Cadastro de Oportunidades" },
      { id: "10-3", name: "Atendimento ao Cliente" }
    ]
  },
  {
    id: 11,
    name: "Segurança",
    description: "Colaboradores, permissões, tags, integrações multiloja",
    icon: "lock",
    subItems: [
      { id: "11-1", name: "Colaboradores" },
      { id: "11-2", name: "Permissões" },
      { id: "11-3", name: "Cadastro de Textos" },
      { id: "11-4", name: "Multiloja" }
    ]
  }
];

export const ADHERENCE_LABELS = [
  { value: 1, label: "Não Aderente", color: "destructive" },
  { value: 2, label: "Pouco Aderente", color: "warning" },
  { value: 3, label: "Parcialmente Aderente", color: "warning" },
  { value: 4, label: "Muito Aderente", color: "success" },
  { value: 5, label: "Totalmente Aderente", color: "success" }
];

export const IMPORTANCE_LABELS = [
  { value: 1, label: "Não Importante", color: "muted" },
  { value: 2, label: "Pouco Importante", color: "muted" },
  { value: 3, label: "Importante", color: "info" },
  { value: 4, label: "Muito Importante", color: "info" },
  { value: 5, label: "Crítico", color: "destructive" }
];
