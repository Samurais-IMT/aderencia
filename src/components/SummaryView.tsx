import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./ui/table";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, FileText, Info } from "lucide-react";
import { Module } from "@/types/adherence";
import { PluginEvaluation, PLUGINS_WITH_COMPANY_QUESTION } from "@/types/plugins";
import { LabelEvaluation } from "@/types/labels";
import ModuleIcon from "./ModuleIcon";
import ImplementationTimeline from "./ImplementationTimeline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SummaryViewProps {
  modules: Module[];
  clientInfo: {
    clientName: string;
    meetingDate: string;
    consultantName: string;
    collaboratorName: string;
  };
  pluginEvaluations?: PluginEvaluation[];
  labelEvaluations?: LabelEvaluation[];
  onBack: () => void;
  onSave: () => void;
  onBackToHistory: () => void;
}

const SummaryView = ({ modules, clientInfo, pluginEvaluations, labelEvaluations, onBack, onSave, onBackToHistory }: SummaryViewProps) => {
  const buildEmailHtml = () => {
    const activeModules = modules.filter(m => m.willUse !== false);
    const adherence = activeModules.length > 0 ? Math.round(
      (activeModules.reduce((sum, m) => sum + m.adherence, 0) / (activeModules.length * 5)) * 100
    ) : 0;
    const totalWeight = activeModules.reduce((sum, m) => sum + m.importance, 0);
    const weighted = totalWeight > 0 ? Math.round(
      (activeModules.reduce((sum, m) => sum + m.adherence * m.importance, 0) / (totalWeight * 5)) * 100
    ) : 0;
    const attended = activeModules.filter(m => m.adherence >= 4).length;
    const critical = activeModules.filter(m => m.importance === 5 && m.adherence < 3);
    const contractedPluginsList = pluginEvaluations?.filter(p => !p.notContracted && p.relevance > 0) || [];
    const evaluatedLabelsList = labelEvaluations?.filter(l => l.relevance > 0) || [];

    const modulesRows = activeModules.map(m => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${m.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${m.adherence}/5</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${m.importance}/5</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${((m.adherence / 5) * (m.importance / 5) * 100).toFixed(0)}%</td>
      </tr>
    `).join('');

    const pluginsRows = contractedPluginsList.map(p => {
      const companyQ = PLUGINS_WITH_COMPANY_QUESTION.find(q => q.code === p.code);
      const hasCompanies = companyQ && p.companySelections && p.companySelections.length > 0;
      const companiesText = hasCompanies
        ? `<br/><span style="font-size:12px;color:#3b82f6;">🏢 ${p.companySelections!.sort((a: number, b: number) => a - b).map((n: number) => `Empresa ${n}`).join(', ')}</span>`
        : '';
      return `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${p.code} - ${p.name}${companiesText}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.relevance}/5</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.adherence}/5</td>
        <td style="padding:8px;border:1px solid #ddd;">${p.adherenceNote || '-'}</td>
      </tr>
    `;
    }).join('');

    const labelsRows = evaluatedLabelsList.map(l => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${l.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${l.relevance}/5</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${l.adherence}/5</td>
        <td style="padding:8px;border:1px solid #ddd;">${l.adherenceNote || '-'}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;">
        <h1 style="color:#1a1a2e;text-align:center;">Resumo da Avaliação de Aderência</h1>
        <p style="text-align:center;color:#666;">Cliente: <strong>${clientInfo.clientName}</strong></p>
        <p style="text-align:center;color:#666;">Data: ${format(new Date(clientInfo.meetingDate), "dd/MM/yyyy 'às' HH:mm")}</p>
        <p style="text-align:center;color:#666;">Consultor: ${clientInfo.consultantName}</p>
        ${clientInfo.collaboratorName ? `<p style="text-align:center;color:#666;">Colaborador (Cliente): ${clientInfo.collaboratorName}</p>` : ''}
        
        <div style="display:flex;gap:16px;margin:24px 0;justify-content:center;">
          <div style="background:#f0f9f0;padding:16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:bold;color:${adherence >= 70 ? '#22c55e' : adherence >= 40 ? '#f59e0b' : '#ef4444'};">${adherence}%</div>
            <div style="font-size:12px;color:#666;">Aderência Geral</div>
          </div>
          <div style="background:#f0f0ff;padding:16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:bold;color:${weighted >= 70 ? '#22c55e' : weighted >= 40 ? '#f59e0b' : '#ef4444'};">${weighted}%</div>
            <div style="font-size:12px;color:#666;">Aderência Ponderada</div>
          </div>
          <div style="background:#fff7ed;padding:16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:bold;color:#3b82f6;">${attended}/${activeModules.length}</div>
            <div style="font-size:12px;color:#666;">Módulos Aderentes</div>
          </div>
        </div>

        ${critical.length > 0 ? `
          <div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:8px;margin:16px 0;">
            <strong style="color:#dc2626;">⚠ Módulos Críticos Não Aderentes:</strong>
            <ul>${critical.map(m => `<li>${m.name} (Aderência: ${m.adherence}/5)</li>`).join('')}</ul>
          </div>
        ` : ''}

        <h2 style="color:#1a1a2e;margin-top:24px;">Módulos</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Módulo</th>
              <th style="padding:8px;border:1px solid #ddd;">Aderência</th>
              <th style="padding:8px;border:1px solid #ddd;">Importância</th>
              <th style="padding:8px;border:1px solid #ddd;">Índice</th>
            </tr>
          </thead>
          <tbody>${modulesRows}</tbody>
        </table>

        ${contractedPluginsList.length > 0 ? `
          <h2 style="color:#1a1a2e;margin-top:24px;">Plugins/Integrações</h2>
          <table style="width:100%;border-collapse:collapse;margin:12px 0;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Plugin</th>
                <th style="padding:8px;border:1px solid #ddd;">Relevância</th>
                <th style="padding:8px;border:1px solid #ddd;">Aderência</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Observação</th>
              </tr>
            </thead>
            <tbody>${pluginsRows}</tbody>
          </table>
        ` : ''}

        ${evaluatedLabelsList.length > 0 ? `
          <h2 style="color:#1a1a2e;margin-top:24px;">Etiquetas</h2>
          <table style="width:100%;border-collapse:collapse;margin:12px 0;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Etiqueta</th>
                <th style="padding:8px;border:1px solid #ddd;">Relevância</th>
                <th style="padding:8px;border:1px solid #ddd;">Aderência</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Observação</th>
              </tr>
            </thead>
            <tbody>${labelsRows}</tbody>
          </table>
        ` : ''}

        <p style="text-align:center;color:#999;font-size:12px;margin-top:32px;">
          Gerado automaticamente pelo UNO Predict em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </p>
      </div>
    `;
  };

  const sendEvaluationEmail = async () => {
    try {
      const htmlContent = buildEmailHtml();
      const activeModules = modules.filter(m => m.willUse !== false);
      const overallAdherence = activeModules.length > 0 ? Math.round(
        (activeModules.reduce((sum, m) => sum + m.adherence, 0) / (activeModules.length * 5)) * 100
      ) : 0;

      const payload = {
        clientInfo,
        modules: modules.map(m => ({
          id: m.id,
          name: m.name,
          willUse: m.willUse,
          adherence: m.adherence,
          importance: m.importance,
          subItems: m.subItems.map(si => ({
            id: si.id,
            name: si.name,
            importance: si.importance,
            adherence: si.adherence,
            adherenceNote: si.adherenceNote
          })),
          notes: m.notes
        })),
        plugins: pluginEvaluations?.filter(p => !p.notContracted && p.relevance > 0).map(p => ({
          code: p.code,
          name: p.name,
          relevance: p.relevance,
          adherence: p.adherence,
          note: p.adherenceNote,
          companySelections: p.companySelections,
        })),
        labels: labelEvaluations?.filter(l => l.relevance > 0).map(l => ({
          name: l.name,
          relevance: l.relevance,
          adherence: l.adherence,
          note: l.adherenceNote,
        })),
        overallAdherence,
        htmlContent,
        emailSubject: `Avaliação de Aderência - ${clientInfo.clientName} - ${format(new Date(clientInfo.meetingDate), "dd/MM/yyyy")}`,
        timestamp: new Date().toISOString()
      };

      const { data: sessionData } = await supabase.auth.getSession();
      await supabase.functions.invoke('send-evaluation-webhook', {
        body: payload,
      });

      toast.success('Avaliação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  const handleSaveWithWebhook = async () => {
    onSave();
    sendEvaluationEmail();
  };

  const generatePDF = async () => {
    const element = document.getElementById("summary-content");
    if (!element) return;

    // Add page-break avoidance classes temporarily
    const style = document.createElement('style');
    style.textContent = `
      #summary-content tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      #summary-content .card, #summary-content [class*="Card"] { page-break-inside: avoid !important; break-inside: avoid !important; }
      #summary-content h2, #summary-content h3 { page-break-after: avoid !important; break-after: avoid !important; }
      #summary-content table { page-break-inside: auto !important; }
      #summary-content thead { display: table-header-group; }
    `;
    document.head.appendChild(style);

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `avaliacao-${clientInfo.clientName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      enableLinks: true,
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await html2pdf().set(opt).from(element).save();
    document.head.removeChild(style);
  };

  const activeModules = modules.filter(m => m.willUse !== false);
  
  // Cálculos - APENAS módulos (sem plugins/etiquetas)
  const overallAdherence = activeModules.length > 0 ? Math.round(
    (activeModules.reduce((sum, m) => sum + m.adherence, 0) / (activeModules.length * 5)) * 100
  ) : 0;

  const totalWeight = activeModules.reduce((sum, m) => sum + m.importance, 0);
  const weightedImportance = totalWeight > 0 ? Math.round(
    (activeModules.reduce((sum, m) => sum + m.adherence * m.importance, 0) / (totalWeight * 5)) * 100
  ) : 0;

  const modulesAttended = activeModules.filter((m) => m.adherence >= 4).length;

  const criticalNotAttended = activeModules.filter(
    (m) => m.importance === 5 && m.adherence < 3
  );

  const getAdherenceColor = (value: number) => {
    if (value >= 70) return "text-success";
    if (value >= 40) return "text-warning";
    return "text-destructive";
  };

  const getAdherenceBadge = (value: number) => {
    if (value === 5) return <Badge className="bg-success">Aderente</Badge>;
    if (value >= 4) return <Badge className="bg-info">Parcial</Badge>;
    if (value >= 3) return <Badge className="bg-warning">Médio</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  const getImportanceBadge = (value: number) => {
    if (value === 5) return <Badge variant="destructive">Crítico</Badge>;
    if (value >= 4) return <Badge className="bg-info">Alto</Badge>;
    return <Badge variant="secondary">Médio</Badge>;
  };

  // Plugins contratados
  const contractedPlugins = pluginEvaluations?.filter(p => !p.notContracted && p.relevance > 0) || [];

  // Etiquetas avaliadas
  const evaluatedLabels = labelEvaluations?.filter(l => l.relevance > 0) || [];

  const getLabelShortName = (fullName: string) => {
    const modelMatch = fullName.match(/^(Etiqueta Produto)\s*\((Modelo \d+)/);
    if (modelMatch) return `${modelMatch[1]} (${modelMatch[2]})`;
    const uaMatch = fullName.match(/^(Etiqueta UA)/);
    if (uaMatch) return uaMatch[1];
    const match = fullName.match(/^([^(]+)/);
    return match ? match[1].trim() : fullName;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div id="summary-content" className="space-y-6 relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ top: '200px' }}>
          <img
            src="/marca-dagua-resumo.jpg"
            alt=""
            className="w-[500px] h-[500px] opacity-[0.06]"
            style={{ filter: "grayscale(100%)" }}
          />
        </div>

        {/* Header */}
        <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold mb-2">Resumo da Avaliação</h2>
          <p className="text-muted-foreground text-lg">{clientInfo.clientName}</p>
          <p className="text-muted-foreground text-sm">
            Data da Avaliação: {format(new Date(clientInfo.meetingDate), "dd/MM/yyyy 'às' HH:mm")}
          </p>
          <p className="text-muted-foreground text-sm">
            Consultor: {clientInfo.consultantName}
          </p>
          {clientInfo.collaboratorName && (
            <p className="text-muted-foreground text-sm">
              Colaborador (Cliente): {clientInfo.collaboratorName}
            </p>
          )}
        </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground text-center">
              Taxa de Aderência Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-4xl font-bold ${getAdherenceColor(overallAdherence)}`}>
              {overallAdherence}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Média de aderência dos módulos
            </p>
            <div className="mt-3 p-2 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Σ Aderência dos módulos / (Nº módulos × 5) × 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground text-center">
              Importância Atingida
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-4xl font-bold ${getAdherenceColor(weightedImportance)}`}>
              {weightedImportance}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aderência ponderada pela importância
            </p>
            <div className="mt-3 p-2 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Σ (Aderência × Importância) / (Σ Importância × 5) × 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-muted-foreground text-center">
              Módulos Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary">
              {modulesAttended}/{activeModules.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Módulos com aderência ≥ 4
            </p>
            <div className="mt-3 p-2 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Nº módulos com aderência ≥ 4 / Total de módulos ativos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {criticalNotAttended.length > 0 && (
        <Card className="border-destructive relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Módulos Críticos com Baixa Aderência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalNotAttended.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-center gap-3 p-3 bg-destructive/10 rounded-lg"
                >
                  <ModuleIcon icon={module.icon} className="w-5 h-5 text-destructive" />
                  <span className="font-medium">{module.name}</span>
                  <Badge variant="destructive">Ação Necessária</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela Detalhada - Módulos */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle>Avaliação Detalhada por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-bold">Módulo</TableHead>
                <TableHead className="text-center font-bold">Importância</TableHead>
                <TableHead className="text-center font-bold">Aderência</TableHead>
                <TableHead className="text-center font-bold">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center justify-center gap-1 w-full">
                        Índice <Info className="w-3 h-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Índice = Aderência × Importância</p>
                        <p className="text-xs">Representa o peso do módulo no resultado geral</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-center font-bold">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <ModuleIcon icon={module.icon} className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{module.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {module.willUse === false ? "-" : getImportanceBadge(module.importance)}
                  </TableCell>
                  <TableCell className="text-center">
                    {module.willUse === false ? (
                      <Badge variant="secondary">Não utiliza</Badge>
                    ) : (
                      getAdherenceBadge(module.adherence)
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-lg">
                      {module.willUse === false ? "-" : module.adherence * module.importance}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground max-w-xs">
                    {module.willUse === false ? "Módulo não utilizado" : (module.notes || "-")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plugins */}
      {contractedPlugins.length > 0 && (
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle>Plugins/Integrações Contratados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-bold">Plugin</TableHead>
                  <TableHead className="text-center font-bold">Relevância</TableHead>
                  <TableHead className="text-center font-bold">Aderência</TableHead>
                  <TableHead className="text-center font-bold">Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {contractedPlugins.map((plugin) => {
                const companyQ = PLUGINS_WITH_COMPANY_QUESTION.find(q => q.code === plugin.code);
                const hasCompanies = companyQ && plugin.companySelections && plugin.companySelections.length > 0;
                return (
                  <TableRow key={plugin.id}>
                    <TableCell className="text-center">
                      <div>
                        <span className="text-muted-foreground mr-1">{plugin.code}</span> {plugin.name}
                        {hasCompanies && (
                          <div className="text-xs text-primary mt-1">
                            🏢 {plugin.companySelections!.sort((a, b) => a - b).map(n => `Empresa ${n}`).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{plugin.relevance}/5</TableCell>
                    <TableCell className="text-center">
                      {getAdherenceBadge(plugin.adherence)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {plugin.adherenceNote || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2 text-center italic">
              * Plugins não são considerados no cálculo de aderência geral
            </p>
          </CardContent>
        </Card>
      )}

      {/* Etiquetas */}
      {evaluatedLabels.length > 0 && (
        <Card className="relative z-10">
          <CardHeader>
            <CardTitle>Etiquetas Padrões UNO ERP</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-bold">Etiqueta</TableHead>
                  <TableHead className="text-center font-bold">Relevância</TableHead>
                  <TableHead className="text-center font-bold">Aderência</TableHead>
                  <TableHead className="text-center font-bold">Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluatedLabels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell className="text-center">{getLabelShortName(label.name)}</TableCell>
                    <TableCell className="text-center">{label.relevance}/5</TableCell>
                    <TableCell className="text-center">
                      {getAdherenceBadge(label.adherence)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {label.adherenceNote || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-2 text-center italic">
              * Etiquetas não são consideradas no cálculo de aderência geral
            </p>
          </CardContent>
        </Card>
      )}

      {/* Especificação Técnica de Hospedagem */}
      {(() => {
        const hostingPluginCodes = [
          "4.1.38", "4.6.1", "4.6.59", "4.6.4", "4.6.60", "4.6.61", "4.6.62",
          "4.1.41", "4.1.35", "4.1.78", "4.1.58b", "4.1.52b", "4.1.63",
          "4.1.59b", "4.6.63", "4.6.63b", "5.1"
        ];
        const matchedPlugins = contractedPlugins.filter(p => hostingPluginCodes.includes(p.code));
        if (matchedPlugins.length === 0) return null;
        return (
          <Card className="border-warning bg-warning/5 relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Especificação Técnica de Hospedagem para o Ambiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {matchedPlugins.map((p) => (
                  <li key={p.id} className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
                    <Info className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                    <span>
                      Para utilização do Plugin <strong>{p.code} {p.name}</strong>, é necessário atender aos requisitos de infraestrutura: <em>Obrigatório utilização de servidor Virtualizado (não compatível com servidor ASP compartilhado).</em>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })()}

      {/* Recomendações */}
      <Card className="bg-primary/5 border-primary relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recomendações Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {activeModules
              .filter((m) => m.importance >= 4 && m.adherence < 3)
              .map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <span>
                    <strong>Foco em {m.name}:</strong> Alta importância ({m.importance}) mas baixa aderência ({m.adherence})
                  </span>
                </li>
              ))}
            {activeModules
              .filter((m) => m.importance >= 4 && m.adherence >= 4)
              .map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                  <span>
                    <strong>Oportunidade em {m.name}:</strong> Alta aderência ({m.adherence}) e importância ({m.importance}) - venda forte!
                  </span>
                </li>
              ))}
            {activeModules
              .filter((m) => m.importance < 3)
              .map((m) => (
                <li key={m.id} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>
                    <strong>{m.name}:</strong> Módulo não crítico - pode ser implementado em fase 2
                  </span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      </div>

      {/* Cronograma de Implantação */}
      <ImplementationTimeline />

      {/* Ações */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={() => { onBackToHistory(); window.scrollTo({ top: 0 }); }} className="flex-1 min-w-[180px]">
          Histórico
        </Button>
        <Button variant="outline" onClick={() => { onBack(); window.scrollTo({ top: 0 }); }} className="flex-1 min-w-[180px]">
          Voltar e Editar
        </Button>
        <Button onClick={handleSaveWithWebhook} className="flex-1 min-w-[180px]" size="lg">
          Gravar Avaliação
        </Button>
      </div>

      <div className="text-center mt-4">
        <Button onClick={generatePDF} variant="secondary" size="lg">
          <FileText className="w-4 h-4 mr-2" />
          Gerar PDF
        </Button>
      </div>
    </div>
  );
};

export default SummaryView;
