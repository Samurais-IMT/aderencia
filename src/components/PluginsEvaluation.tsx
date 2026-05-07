import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { ChevronLeft, ChevronRight, Home, Trash2, CheckCircle2, Puzzle } from "lucide-react";
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
import { Checkbox } from "./ui/checkbox";
import { PluginEvaluation, PLUGINS_WITH_COMPANY_QUESTION } from "@/types/plugins";



const ITEMS_PER_PAGE = 20;

interface PluginsEvaluationProps {
  plugins: PluginEvaluation[];
  contracted: boolean | null;
  totalModules: number;
  cnpjCount: number;
  onUpdateContracted: (value: boolean) => void;
  onUpdatePlugin: (pluginId: string, updates: Partial<PluginEvaluation>) => void;
  onClearPlugins: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onGoHome?: () => void;
}

const PluginsEvaluation = ({
  plugins,
  contracted,
  totalModules,
  cnpjCount,
  onUpdateContracted,
  onUpdatePlugin,
  onClearPlugins,
  onNext,
  onPrevious,
  onGoHome,
}: PluginsEvaluationProps) => {
  const [showValidation, setShowValidation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(plugins.length / ITEMS_PER_PAGE);
  const paginatedPlugins = plugins.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const progress = (totalModules / totalModules) * 100;

  const allNotContracted = useMemo(() => plugins.every((p) => p.notContracted), [plugins]);

  const handleSelectAllNotContracted = (checked: boolean) => {
    plugins.forEach((p) => {
      onUpdatePlugin(p.id, {
        notContracted: checked,
        ...(checked ? { relevance: 0, adherence: 0, adherenceNote: "" } : {}),
      });
    });
  };

  // Check if 9.1.12C is contracted
  const isAgentePrintContracted = useMemo(() => {
    const plugin = plugins.find((p) => p.code === "9.1.12C");
    return plugin ? !plugin.notContracted && plugin.relevance > 0 : false;
  }, [plugins]);

  const getMissingFields = () => {
    if (contracted === null) return ["Selecione se o cliente contratou serviços adicionais"];
    if (contracted === false) return [];
    const missing: string[] = [];
    plugins.forEach((p) => {
      if (p.notContracted) return;
      if (p.relevance === 0) missing.push(`${p.code} - ${p.name}: Relevância`);
      if (p.adherence === 0) missing.push(`${p.code} - ${p.name}: Aderência`);
      if (p.adherence > 0 && p.adherence < 5 && !p.adherenceNote.trim())
        missing.push(`${p.code} - ${p.name}: Justificativa de aderência`);
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

  return (
    <div className="max-w-5xl mx-auto animate-fade-in relative">
      <div className="relative z-10">
        {/* Home + progress */}
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
                Módulo {totalModules} de {totalModules}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
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
                <Puzzle className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">Plugins/Integrações</CardTitle>
                <CardDescription className="text-base mt-1">
                  Serviços adicionais contratados para configuração de extensões e integrações
                </CardDescription>
              </div>
            </div>

            {/* Contracted? */}
            <div className="flex items-center gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
              <Label className="text-base font-semibold">Cliente contratou serviços adicionais?</Label>
              <RadioGroup
                value={contracted === true ? "yes" : contracted === false ? "no" : ""}
                onValueChange={(v) => {
                  const isYes = v === "yes";
                  onUpdateContracted(isYes);
                  if (!isYes) {
                    setTimeout(() => {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }, 100);
                  }
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="contracted-yes" />
                  <Label htmlFor="contracted-yes" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="contracted-no" />
                  <Label htmlFor="contracted-no" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            <div className={`${contracted !== true ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "220px" }} />
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
                    <col style={{ width: "32px" }} />
                    <col style={{ width: "80px" }} />
                    <col style={{ width: "80px" }} />
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
                      <th className="py-3">
                        <div className="w-[2px] h-10 bg-foreground mx-auto" />
                      </th>
                      <th className="text-center py-3 text-base font-semibold" colSpan={2}>
                        <span className="text-primary">Não contratado</span>
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
                      <th><div className="w-[2px] h-8 bg-foreground mx-auto" /></th>
                      <th colSpan={2} className="text-center py-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <input
                                type="checkbox"
                                checked={allNotContracted}
                                onChange={(e) => handleSelectAllNotContracted(e.target.checked)}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent>Selecionar todos</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                      <th colSpan={2}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPlugins.map((plugin) => {
                      const isNotContracted = plugin.notContracted;
                      const hasError = showValidation && !isNotContracted && (
                        plugin.relevance === 0 || plugin.adherence === 0 ||
                        (plugin.adherence > 0 && plugin.adherence < 5 && !plugin.adherenceNote.trim())
                      );
                      return (
                        <>
                          <tr key={plugin.id} className={`border-b border-foreground/20 ${hasError ? "bg-destructive/5" : ""}`}>
                            <td className="py-3 px-2 font-medium text-xs">
                              <span className="text-muted-foreground mr-1">{plugin.code}</span> {plugin.name}
                            </td>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <td key={`rel-${n}`} className="py-3 text-center">
                                <input
                                  type="radio"
                                  name={`relevance-${plugin.id}`}
                                  checked={plugin.relevance === n}
                                  onChange={() => onUpdatePlugin(plugin.id, { relevance: n, notContracted: false })}
                                  disabled={isNotContracted}
                                  className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-30"
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
                                  name={`adherence-${plugin.id}`}
                                  checked={plugin.adherence === n}
                                  onChange={() => onUpdatePlugin(plugin.id, {
                                    adherence: n,
                                    adherenceNote: n === 5 ? "" : plugin.adherenceNote,
                                    notContracted: false,
                                  })}
                                  disabled={isNotContracted}
                                  className="w-4 h-4 accent-primary cursor-pointer disabled:opacity-30"
                                />
                              </td>
                            ))}
                            <td className="py-3 text-center">
                              <div className="w-[2px] h-6 bg-foreground mx-auto" />
                            </td>
                            <td className="py-3 text-center" colSpan={2}>
                              <input
                                type="checkbox"
                                checked={isNotContracted}
                                onChange={(e) => onUpdatePlugin(plugin.id, {
                                  notContracted: e.target.checked,
                                  ...(e.target.checked ? { relevance: 0, adherence: 0, adherenceNote: "" } : {}),
                                })}
                                className="w-4 h-4 accent-primary cursor-pointer"
                              />
                            </td>
                          </tr>
                          {!isNotContracted && plugin.adherence > 0 && plugin.adherence < 5 && (
                            <tr key={`note-${plugin.id}`}>
                              <td colSpan={15} className="px-2 py-3 border-b border-foreground/10">
                                <Label className="text-sm font-semibold">
                                  {plugin.code} - {plugin.name} — Por que não é 100% aderente? <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                  value={plugin.adherenceNote}
                                  onChange={(e) => onUpdatePlugin(plugin.id, { adherenceNote: e.target.value })}
                                  placeholder={`Descreva o motivo da aderência ${plugin.adherence}/5...`}
                                  maxLength={500}
                                  rows={2}
                                  className={`mt-1 resize-none ${showValidation && !plugin.adherenceNote.trim() ? "border-destructive border-2 ring-destructive/20 ring-2" : ""}`}
                                />
                                <div className="text-xs text-muted-foreground text-right mt-1">
                                  {plugin.adherenceNote.length}/500
                                </div>
                              </td>
                            </tr>
                          )}
                          {plugin.adherence === 5 && !isNotContracted && (
                            <tr key={`ok-${plugin.id}`}>
                              <td colSpan={15} className="px-2 py-1 border-b border-foreground/10">
                                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% aderente!
                                </span>
                              </td>
                            </tr>
                          )}
                          {/* Company selection for specific plugins when cnpjCount >= 2 */}
                          {cnpjCount >= 2 && !isNotContracted && (() => {
                            const companyQ = PLUGINS_WITH_COMPANY_QUESTION.find(q => q.code === plugin.code);
                            if (!companyQ) return null;
                            const selections = plugin.companySelections || [];
                            return (
                              <tr key={`company-${plugin.id}`}>
                                <td colSpan={15} className="px-2 py-3 border-b border-foreground/10">
                                  <Label className="text-sm font-semibold block mb-2">
                                    🏢 {companyQ.question}
                                  </Label>
                                  <div className="flex flex-wrap gap-3">
                                    {Array.from({ length: cnpjCount }, (_, i) => i + 1).map((num) => (
                                      <label key={num} className="flex items-center gap-2 cursor-pointer text-sm bg-muted/50 px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                                        <Checkbox
                                          checked={selections.includes(num)}
                                          onCheckedChange={(checked) => {
                                            const newSelections = checked
                                              ? [...selections, num]
                                              : selections.filter(s => s !== num);
                                            onUpdatePlugin(plugin.id, { companySelections: newSelections });
                                          }}
                                        />
                                        Empresa {num}
                                      </label>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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
            </div>

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
                    <AlertDialogAction onClick={onClearPlugins}>Sim, limpar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TooltipProvider>
                <Tooltip open={showValidation && !canProceed ? true : undefined}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleNext}
                      disabled={contracted === null}
                      className="flex-1"
                      onMouseLeave={() => setShowValidation(false)}
                    >
                      {isAgentePrintContracted ? "Próximo" : "Ver Resumo"}
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

export default PluginsEvaluation;
