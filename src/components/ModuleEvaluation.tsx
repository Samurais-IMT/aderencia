import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle2, Home, Trash2 } from "lucide-react";
import { Module, SubItem } from "@/types/adherence";
import ModuleIcon from "./ModuleIcon";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
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

// Tooltip map for specific sub-items
const SUB_ITEM_TOOLTIPS: Record<string, string> = {
  "4-6": "Particularidade plugin: 4.1.34 - Radar de Monitoramento e Download de NFes e CTes",
  "6-5": "Particularidade plugin: 4.1.14 - SIGEP - Gerenciador de Postagens dos Correios",
  "6-6": "Particularidade plugin: 3.3 - NFS-e / RPS",
  "11-3": "Tags",
  "11-4": "Integrações eCommerce",
};

interface ModuleEvaluationProps {
  modules: Module[];
  currentModuleIndex: number;
  onUpdateModule: (moduleId: number, updates: Partial<Module>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onGoHome?: () => void;
  totalModules?: number;
}

const ModuleEvaluation = ({
  modules,
  currentModuleIndex,
  onUpdateModule,
  onNext,
  onPrevious,
  onComplete,
  onGoHome,
  totalModules
}: ModuleEvaluationProps) => {
  const [showValidation, setShowValidation] = useState(false);
  const currentModule = modules[currentModuleIndex];
  const total = totalModules || modules.length;
  const progress = ((currentModuleIndex + 1) / total) * 100;
  const isLastModule = currentModuleIndex === modules.length - 1;

  const getMissingFields = () => {
    if (currentModule.willUse === null) return ["Selecione se o cliente utilizará o módulo"];
    if (currentModule.willUse === false) return [];
    const missing: string[] = [];
    currentModule.subItems.forEach((si) => {
      if (si.importance === 0) missing.push(`${si.name}: Importância`);
      if (si.adherence === 0) missing.push(`${si.name}: Aderência`);
      if (si.adherence > 0 && si.adherence < 5 && !si.adherenceNote.trim())
        missing.push(`${si.name}: Justificativa de aderência`);
    });
    return missing;
  };

  const isModuleComplete = () => getMissingFields().length === 0;
  const canProceed = isModuleComplete();

  const handleNext = () => {
    if (!canProceed) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (isLastModule) {
      onComplete();
    } else {
      onNext();
    }
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  const handlePrevious = () => {
    setShowValidation(false);
    onPrevious();
    window.scrollTo({ top: 0 });
  };

  const handleWillUseChange = (value: string) => {
    const willUse = value === "yes";
    onUpdateModule(currentModule.id, { willUse });
    setShowValidation(false);
    if (!willUse) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  };

  const handleSubItemUpdate = (subItemId: string, updates: Partial<SubItem>) => {
    const updatedSubItems = currentModule.subItems.map((si) =>
      si.id === subItemId ? { ...si, ...updates } : si
    );
    const filledItems = updatedSubItems.filter(si => si.adherence > 0 && si.importance > 0);
    const avgAdherence = filledItems.length > 0
      ? Math.round(filledItems.reduce((s, si) => s + si.adherence, 0) / filledItems.length)
      : 0;
    const avgImportance = filledItems.length > 0
      ? Math.round(filledItems.reduce((s, si) => s + si.importance, 0) / filledItems.length)
      : 0;

    onUpdateModule(currentModule.id, {
      subItems: updatedSubItems,
      adherence: avgAdherence,
      importance: avgImportance
    });
  };

  const handleClearFields = () => {
    const clearedSubItems = currentModule.subItems.map((si) => ({
      ...si,
      importance: 0,
      adherence: 0,
      adherenceNote: ""
    }));
    onUpdateModule(currentModule.id, {
      willUse: null,
      subItems: clearedSubItems,
      adherence: 0,
      importance: 0
    });
    setShowValidation(false);
  };

  // Only generate recommendations when ALL text fields are filled
  const subItemsNeedingNotes = currentModule.subItems.filter(
    (si) => si.adherence > 0 && si.adherence < 5
  );
  const allNotesFilled =
    subItemsNeedingNotes.length === 0
      ? false
      : subItemsNeedingNotes.every((si) => si.adherenceNote.trim().length > 0);

  const generateSmartSummary = () => {
    if (!allNotesFilled) return "";

    const lowAdherence = currentModule.subItems.filter(si => si.adherence > 0 && si.adherence <= 2);
    const medAdherence = currentModule.subItems.filter(si => si.adherence === 3 || si.adherence === 4);
    const fullAdherence = currentModule.subItems.filter(si => si.adherence === 5);

    const lines: string[] = [];

    if (fullAdherence.length > 0) {
      lines.push(`✅ ${fullAdherence.length} item(ns) com aderência total: ${fullAdherence.map(si => si.name).join(", ")}.`);
    }

    if (lowAdherence.length > 0) {
      lines.push(`\n⚠️ Itens com baixa aderência (1-2) que necessitam atenção especial:`);
      lowAdherence.forEach(si => {
        lines.push(`  → ${si.name} (${si.adherence}/5): ${si.adherenceNote}`);
        lines.push(`    💡 Recomendação: Avaliar desenvolvimento de telas customizáveis ou integrações específicas para atender à necessidade do cliente.`);
      });
    }

    if (medAdherence.length > 0) {
      lines.push(`\n🔶 Itens com aderência parcial (3-4) que podem ser ajustados:`);
      medAdherence.forEach(si => {
        lines.push(`  → ${si.name} (${si.adherence}/5): ${si.adherenceNote}`);
        lines.push(`    💡 Recomendação: Considerar uso de objetos customizáveis, configurações alternativas ou parametrizações do sistema.`);
      });
    }

    if (lowAdherence.length > 0 || medAdherence.length > 0) {
      lines.push(`\n📋 Ações sugeridas:`);
      if (lowAdherence.length > 0) {
        lines.push(`  • Agendar reunião técnica para mapear processos dos itens críticos (${lowAdherence.map(si => si.name).join(", ")}).`);
        lines.push(`  • Verificar disponibilidade de plugins ou módulos complementares no UNO ERP.`);
      }
      if (medAdherence.length > 0) {
        lines.push(`  • Explorar parametrizações e configurações existentes para ${medAdherence.map(si => si.name).join(", ")}.`);
      }
      lines.push(`  • Documentar gaps identificados para planejamento de customizações.`);
    }

    return lines.join("\n");
  };

  const isDisabled = currentModule.willUse === false || currentModule.willUse === null;
  const missingFields = getMissingFields();

  const renderSubItemName = (subItem: SubItem) => {
    const tooltipText = SUB_ITEM_TOOLTIPS[subItem.id];
    if (tooltipText) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted underline-offset-2">{subItem.name}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span>{subItem.name}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      <div className="relative z-10">
        {/* Home button + progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {onGoHome && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={onGoHome}
                        className="h-8 w-8"
                      >
                        <Home className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voltar para a página inicial</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-sm font-medium text-muted-foreground">
                Módulo {currentModuleIndex + 1} de {total}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 relative overflow-hidden">
          {/* Watermark inside the card */}
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
                <ModuleIcon icon={currentModule.icon} className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{currentModule.name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {currentModule.description}
                </CardDescription>
              </div>
            </div>

            {/* Will use module? */}
            <div className="flex items-center gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
              <Label className="text-base font-semibold">Cliente utilizará o módulo?</Label>
              <RadioGroup
                value={currentModule.willUse === true ? "yes" : currentModule.willUse === false ? "no" : ""}
                onValueChange={handleWillUseChange}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id={`willuse-yes-${currentModule.id}`} />
                  <Label htmlFor={`willuse-yes-${currentModule.id}`} className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id={`willuse-no-${currentModule.id}`} />
                  <Label htmlFor={`willuse-no-${currentModule.id}`} className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Sub-items table */}
            <div className={`${isDisabled ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "180px" }} />
                    {/* 5 importance cols */}
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    {/* divider */}
                    <col style={{ width: "32px" }} />
                    {/* 5 adherence cols */}
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "48px" }} />
                    {/* status */}
                    <col style={{ width: "120px" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 px-2 text-base font-semibold">Item</th>
                      <th className="text-center py-3 text-base font-semibold" colSpan={5}>
                        <span className="text-primary">Importância</span>
                      </th>
                      <th className="py-3">
                        <div className="w-[2px] h-10 bg-foreground mx-auto" />
                      </th>
                      <th className="text-center py-3 text-base font-semibold" colSpan={5}>
                        <span className="text-primary">Aderência</span>
                      </th>
                      <th className="py-3"></th>
                    </tr>
                    <tr className="border-b-2 border-foreground">
                      <th></th>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <th key={`imp-${n}`} className="text-center py-2 text-base font-bold text-foreground">
                          {n}
                        </th>
                      ))}
                      <th>
                        <div className="w-[2px] h-8 bg-foreground mx-auto" />
                      </th>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <th key={`adh-${n}`} className="text-center py-2 text-base font-bold text-foreground">
                          {n}
                        </th>
                      ))}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentModule.subItems.map((subItem) => {
                      const hasValidationError =
                        showValidation &&
                        (subItem.importance === 0 ||
                          subItem.adherence === 0 ||
                          (subItem.adherence > 0 && subItem.adherence < 5 && !subItem.adherenceNote.trim()));

                      return (
                        <>
                          <tr key={subItem.id} className={`border-b border-foreground/20 ${hasValidationError ? "bg-destructive/5" : ""}`}>
                            <td className="py-3 px-2 font-medium">
                              {renderSubItemName(subItem)}
                            </td>

                            {/* Importance radio buttons - centered in each col */}
                            {[1, 2, 3, 4, 5].map((n) => (
                              <td key={`imp-${n}`} className="py-3 text-center">
                                <input
                                  type="radio"
                                  name={`importance-${subItem.id}`}
                                  checked={subItem.importance === n}
                                  onChange={() => handleSubItemUpdate(subItem.id, { importance: n })}
                                  className="w-4 h-4 accent-primary cursor-pointer"
                                />
                              </td>
                            ))}

                            {/* Divider */}
                            <td className="py-3 text-center">
                              <div className="w-[2px] h-6 bg-foreground mx-auto" />
                            </td>

                            {/* Adherence radio buttons - centered in each col */}
                            {[1, 2, 3, 4, 5].map((n) => (
                              <td key={`adh-${n}`} className="py-3 text-center">
                                <input
                                  type="radio"
                                  name={`adherence-${subItem.id}`}
                                  checked={subItem.adherence === n}
                                  onChange={() =>
                                    handleSubItemUpdate(subItem.id, {
                                      adherence: n,
                                      adherenceNote: n === 5 ? "" : subItem.adherenceNote
                                    })
                                  }
                                  className="w-4 h-4 accent-primary cursor-pointer"
                                />
                              </td>
                            ))}

                            {/* Status */}
                            <td className="py-3 px-2">
                              {subItem.adherence === 5 && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-success whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  100% aderente!
                                </span>
                              )}
                            </td>
                          </tr>

                          {/* Adherence note below the row */}
                          {subItem.adherence > 0 && subItem.adherence < 5 && (
                            <tr key={`note-${subItem.id}`}>
                              <td colSpan={13} className="px-2 py-3 border-b border-foreground/10">
                                <Label className="text-sm font-semibold">
                                  {subItem.name} — Por que não é 100% aderente? <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                  value={subItem.adherenceNote}
                                  onChange={(e) =>
                                    handleSubItemUpdate(subItem.id, { adherenceNote: e.target.value })
                                  }
                                  placeholder={`Descreva o motivo da aderência ${subItem.adherence}/5 para ${subItem.name}...`}
                                  maxLength={500}
                                  rows={2}
                                  className={`mt-1 resize-none ${showValidation && !subItem.adherenceNote.trim() ? "border-destructive border-2 ring-destructive/20 ring-2" : ""}`}
                                />
                                <div className="text-xs text-muted-foreground text-right mt-1">
                                  {subItem.adherenceNote.length}/500 caracteres
                                </div>
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
              {currentModule.willUse === true && allNotesFilled && generateSmartSummary() && (
                <div className="mt-6 space-y-3">
                  <Label className="text-base font-semibold">Recomendações e Orientações</Label>
                  <div className="p-4 rounded-lg border border-border/50" style={{ backgroundColor: "#fc984c" }}>
                    <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: "#000000" }}>{generateSmartSummary()}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentModuleIndex === 0}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Campos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar campos</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja limpar todos os campos deste módulo? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearFields}>Sim, limpar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TooltipProvider>
                <Tooltip open={showValidation && !canProceed ? true : undefined}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleNext}
                      disabled={currentModule.willUse === null}
                      className="flex-1"
                      onMouseLeave={() => setShowValidation(false)}
                    >
                      {isLastModule ? "Próximo" : "Próximo"}
                      <ChevronRight className="w-4 h-4 ml-2" />
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

export default ModuleEvaluation;
