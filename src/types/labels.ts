export interface LabelItem {
  id: string;
  name: string;
}

export interface LabelEvaluation extends LabelItem {
  relevance: number;
  adherence: number;
  adherenceNote: string;
}

export const LABEL_LIST: LabelItem[] = [
  { id: "l-1", name: "Etiqueta Cliente (10,5 X 3,5 cm | 1 Coluna)" },
  { id: "l-2", name: "Etiqueta Expedição (10,5 X 6,3 cm | 1 Coluna)" },
  { id: "l-3", name: "Etiqueta Localização (5,5 X 3,5 cm | 1 Coluna)" },
  { id: "l-4", name: "Etiqueta Preço (7,0 X 3,0 cm | 1 Coluna)" },
  { id: "l-5", name: "Etiqueta Produto (Modelo 1 - 4,0 X 2,4 cm | 2 Colunas)" },
  { id: "l-6", name: "Etiqueta Produto (Modelo 2 - 10,0 X 6,0 cm | 1 Coluna)" },
  { id: "l-7", name: "Etiqueta Produto (Modelo 3 - 4,0 X 2,4 cm | 2 Colunas)" },
  { id: "l-8", name: "Etiqueta Produção (10,5 X 6,3 cm | 1 Coluna)" },
  { id: "l-9", name: "Etiqueta Separação (10,0 X 6,0 cm | 1 Coluna)" },
  { id: "l-10", name: "Etiqueta UA (Unidade de Armazenagem) (7,0 X 4,0 cm | 1 Coluna)" },
];
