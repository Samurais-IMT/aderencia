import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ChevronLeft, ChevronRight, Home, Trash2, CheckCircle2, Printer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { LabelEvaluation } from "@/types/labels";

const ITEMS_PER_PAGE = 10;

interface LabelsEvaluationProps {
  labels: LabelEvaluation[];
  onUpdateLabel: (labelId: string, updates: Partial<LabelEvaluation>) => void;
  onClearLabels: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onGoHome?: () => void;
}

const LabelsEvaluation = ({
  labels,
  onUpdateLabel,
  onClearLabels,
  onNext,
  onPrevious,
  onGoHome,
}: LabelsEvaluationProps) => {
  const [showValidation, setShowValidation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(labels.length / ITEMS_PER_PAGE);
  const paginatedLabels = labels.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const getMissingFields = () => {
    const missing: string[] = [];
    labels.forEach((l) => {
      if (l.relevance === 0) missing.push(`${l.name}: Relevância`);
      if (l.adherence === 0) missing.push(`${l.name}: Aderência`);
      if (l.adherence > 0 && l.adherence < 5 && !l.adherenceNote.trim())
        missing.push(`${l.name}: Justificativa de aderência`);
    });
    return missing;
  };

  const canProceed = getMissingFields().length === 0;
  const missingFields = getMissingFields();

  const handleNext = () => {
    if (!canProceed) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    onNext();
  };

  // Smart summary logic
  const subItemsNeedingNotes = labels.filter((l) => l.adherence > 0 && l.adherence < 5);
  const allNotesFilled = subItemsNeedingNotes.length === 0
    ? labels.some((l) => l.adherence > 0)
    : subItemsNeedingNotes.every((l) => l.adherenceNote.trim().length > 0);

  const getShortName = (fullName: string) => {
    // Handle "Etiqueta Produto (Modelo X - ...)" → "Etiqueta Produto (Modelo X)"
    const modelMatch = fullName.match(/^(Etiqueta Produto)\s*\((Modelo \d+)/);
    if (modelMatch) return `${modelMatch[1]} (${modelMatch[2]})`;
    // Handle "Etiqueta UA (Unidade de Armazenagem) ..." → "Etiqueta UA"
    const uaMatch = fullName.match(/^(Etiqueta UA)/);
    if (uaMatch) return uaMatch[1];
    // Default: extract name before parentheses
    const match = fullName.match(/^([^(]+)/);
    return match ? match[1].trim() : fullName;
  };

  const generateSmartSummary = useMemo(() => {
    if (!allNotesFilled) return "";

    const lowAdherence = labels.filter((l) => l.adherence > 0 && l.adherence <= 2);
    const medAdherence = labels.filter((l) => l.adherence === 3 || l.adherence === 4);
    const fullAdherence = labels.filter((l) => l.adherence === 5);

    const lines: string[] = [];

    if (fullAdherence.length > 0) {
      lines.push(`✅ ${fullAdherence.length} etiqueta(s) com aderência total:`);
      fullAdherence.forEach((l) => {
        lines.push(`  • ${getShortName(l.name)}`);
      });
    }

    if (lowAdherence.length > 0) {
      lines.push(`\n⚠️ Etiquetas com baixa aderência (1-2) que necessitam atenção especial:`);
      lowAdherence.forEach((l) => {
        lines.push(`  → ${getShortName(l.name)} (${l.adherence}/5): ${l.adherenceNote}`);
        lines.push(`    💡 Recomendação: Verificar configuração de layout e campos da etiqueta para atender ao formato do cliente.`);
      });
    }

    if (medAdherence.length > 0) {
      lines.push(`\n🔶 Etiquetas com aderência parcial (3-4) que podem ser ajustadas:`);
      medAdherence.forEach((l) => {
        lines.push(`  → ${getShortName(l.name)} (${l.adherence}/5): ${l.adherenceNote}`);
        lines.push(`    💡 Recomendação: Considerar ajustes de dimensões, colunas ou campos personalizados na configuração da etiqueta.`);
      });
    }

    if (lowAdherence.length > 0 || medAdherence.length > 0) {
      lines.push(`\n📋 Ações sugeridas:`);
      if (lowAdherence.length > 0) {
        lines.push(`  • Solicitar amostras de etiquetas do cliente para validação de layout.`);
        lines.push(`  • Verificar compatibilidade da impressora térmica com os formatos requeridos.`);
      }
      medAdherence.forEach((l) => {
        lines.push(`  • Explorar parametrizações de layout existentes para ${getShortName(l.name)}.`);
      });
      lines.push(`  • Documentar gaps identificados para planejamento de customizações.`);
    }

    return lines.join("\n");
  }, [labels, allNotesFilled]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      <div className="relative z-10">
        {/* Home */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {onGoHome && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={onGoHome} className="h-8 w-8">
                        <Home className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voltar para a página inicial</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-sm font-medium text-muted-foreground">
                Etiquetas Padrões UNO ERP
              </span>
            </div>
          </div>
        </div>

        <Card className="border-2 relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src="/marca-dagua.jpg"
              alt=""
              className="w-[600px] h-[600px] opacity-[0.06]"
              style={{ filter: "grayscale(100%)" }}
            />
          </div>

          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                <Printer className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">Etiquetas Padrões UNO ERP</CardTitle>
                <CardDescription className="text-base mt-1">
                  Etiquetas para impressões térmicas
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "280px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "32px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                  <col style={{ width: "48px" }} />
                </colgroup>
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="text-left py-3 px-2 text-base font-semibold">Item</th>
                    <th className="text-center py-3 text-base font-semibold" colSpan={5}>
                      <span className="text-primary">Relevância</span>
                    </th>
                    <th className="py-3">
                      <div className="w-[2px] h-10 bg-foreground mx-auto" />
                    </th>
                    <th className="text-center py-3 text-base font-semibold" colSpan={5}>
                      <span className="text-primary">Aderência</span>
                    </th>
                  </tr>
                  <tr className="border-b-2 border-foreground">
                    <th></th>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <th key={`rel-${n}`} className="text-center py-2 text-base font-bold text-foreground">{n}</th>
                    ))}
                    <th><div className="w-[2px] h-8 bg-foreground mx-auto" /></th>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <th key={`adh-${n}`} className="text-center py-2 text-base font-bold text-foreground">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedLabels.map((label) => {
                    const hasError = showValidation && (
                      label.relevance === 0 || label.adherence === 0 ||
                      (label.adherence > 0 && label.adherence < 5 && !label.adherenceNote.trim())
                    );
                    return (
                      <>
                        <tr key={label.id} className={`border-b border-foreground/20 ${hasError ? "bg-destructive/5" : ""}`}>
                          <td className="py-3 px-2 font-medium text-xs">{label.name}</td>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <td key={`rel-${n}`} className="py-3 text-center">
                              <input
                                type="radio"
                                name={`label-rel-${label.id}`}
                                checked={label.relevance === n}
                                onChange={() => onUpdateLabel(label.id, { relevance: n })}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="py-3 text-center">
                            <div className="w-[2px] h-6 bg-foreground mx-auto" />
                          </td>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <td key={`adh-${n}`} className="py-3 text-center">
                              <input
                                type="radio"
                                name={`label-adh-${label.id}`}
                                checked={label.adherence === n}
                                onChange={() => onUpdateLabel(label.id, {
                                  adherence: n,
                                  adherenceNote: n === 5 ? "" : label.adherenceNote,
                                })}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                        {label.adherence > 0 && label.adherence < 5 && (
                          <tr key={`note-${label.id}`}>
                            <td colSpan={12} className="px-2 py-3 border-b border-foreground/10">
                              <Label className="text-sm font-semibold">
                                {label.name} — O que pode faltar? <span className="text-destructive">*</span>
                              </Label>
                              <Textarea
                                value={label.adherenceNote}
                                onChange={(e) => onUpdateLabel(label.id, { adherenceNote: e.target.value })}
                                placeholder={`Descreva o que pode faltar para aderência ${label.adherence}/5...`}
                                maxLength={500}
                                rows={2}
                                className={`mt-1 resize-none ${showValidation && !label.adherenceNote.trim() ? "border-destructive border-2 ring-destructive/20 ring-2" : ""}`}
                              />
                              <div className="text-xs text-muted-foreground text-right mt-1">
                                {label.adherenceNote.length}/500
                              </div>
                            </td>
                          </tr>
                        )}
                        {label.adherence === 5 && (
                          <tr key={`ok-${label.id}`}>
                            <td colSpan={12} className="px-2 py-1 border-b border-foreground/10">
                              <span className="flex items-center gap-1 text-xs font-semibold text-success">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 100% aderente!
                              </span>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recomendações e Orientações */}
            {allNotesFilled && generateSmartSummary && (
              <div className="mt-6 space-y-3">
                <Label className="text-base font-semibold">Recomendações e Orientações</Label>
                <div className="p-4 rounded-lg border border-border/50" style={{ backgroundColor: "#fc984c" }}>
                  <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: "#000000" }}>{generateSmartSummary}</pre>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => { onPrevious(); window.scrollTo({ top: 0 }); }} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Limpar Campos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar campos</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja limpar todos os campos? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearLabels}>Sim, limpar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TooltipProvider>
                <Tooltip open={showValidation && !canProceed ? true : undefined}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleNext}
                      className="flex-1"
                      onMouseLeave={() => setShowValidation(false)}
                    >
                      Ver Resumo
                    </Button>
                  </TooltipTrigger>
                  {showValidation && !canProceed && missingFields.length > 0 && (
                    <TooltipContent side="top" className="max-w-xs bg-destructive text-destructive-foreground">
                      <p className="font-semibold mb-1">Campos a preencher:</p>
                      <ul className="text-xs space-y-0.5">
                        {missingFields.slice(0, 5).map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                        {missingFields.length > 5 && <li>...e mais {missingFields.length - 5}</li>}
                      </ul>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabelsEvaluation;
