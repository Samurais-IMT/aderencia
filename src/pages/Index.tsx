import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import StepIndicator from "@/components/StepIndicator";
import ClientInfoForm from "@/components/ClientInfoForm";
import ModuleEvaluation from "@/components/ModuleEvaluation";
import PluginsEvaluation from "@/components/PluginsEvaluation";
import LabelsEvaluation from "@/components/LabelsEvaluation";
import SummaryView from "@/components/SummaryView";
import EvaluationHistory from "@/components/EvaluationHistory";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { ClientInfo, Module, MODULE_TEMPLATES } from "@/types/adherence";
import { PLUGIN_LIST, PluginEvaluation } from "@/types/plugins";
import { LABEL_LIST, LabelEvaluation } from "@/types/labels";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentEvaluationId, setCurrentEvaluationId] = useState<string | null>(null);

  // Plugins state
  const [pluginsContracted, setPluginsContracted] = useState<boolean | null>(null);
  const [pluginEvaluations, setPluginEvaluations] = useState<PluginEvaluation[]>([]);

  // Labels state
  const [labelEvaluations, setLabelEvaluations] = useState<LabelEvaluation[]>([]);

  const TOTAL_MODULES = MODULE_TEMPLATES.length + 1;

  const initPlugins = () =>
    PLUGIN_LIST.map((p) => ({
      ...p,
      relevance: 0,
      adherence: 0,
      adherenceNote: "",
      notContracted: false,
    }));

  const initLabels = () =>
    LABEL_LIST.map((l) => ({
      ...l,
      relevance: 0,
      adherence: 0,
      adherenceNote: "",
    }));

  const isAgentePrintContracted = () => {
    const plugin = pluginEvaluations.find((p) => p.code === "9.1.12C");
    return plugin ? !plugin.notContracted && plugin.relevance > 0 : false;
  };

  const createInitialModules = (): Module[] =>
    MODULE_TEMPLATES.map((template) => ({
      ...template,
      willUse: null,
      subItems: template.subItems.map((si) => ({
        ...si,
        importance: 0,
        adherence: 0,
        adherenceNote: "",
      })),
      adherence: 0,
      importance: 0,
      notes: "",
    }));

  useEffect(() => {
    setModules(createInitialModules());
    setPluginEvaluations(initPlugins());
    setLabelEvaluations(initLabels());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentStep, currentModuleIndex]);

  const handleClientInfoSubmit = (info: ClientInfo) => {
    setClientInfo(info);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "auto" });
    toast.success("Informações do cliente salvas!");
  };

  const handleUpdateModule = (moduleId: number, updates: Partial<Module>) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)));
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const handleCompleteEvaluation = () => {
    const allEvaluated = modules.every((m) => {
      if (m.willUse === false) return true;
      return m.subItems.every(
        (si) =>
          si.adherence > 0 &&
          si.importance > 0 &&
          (si.adherence === 5 || si.adherenceNote.trim().length > 0)
      );
    });
    if (!allEvaluated) {
      toast.error("Por favor, avalie todos os sub-itens antes de continuar.");
      return;
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "auto" });
    toast.success("Módulos avaliados! Agora avalie os Plugins/Integrações.");
  };

  const handlePluginsComplete = () => {
    if (pluginsContracted === true) {
      const allFilled = pluginEvaluations.every(
        (p) =>
          p.notContracted ||
          (p.relevance > 0 &&
           p.adherence > 0 &&
           (p.adherence === 5 || p.adherenceNote.trim().length > 0))
      );
      if (!allFilled) {
        toast.error("Por favor, avalie todos os plugins antes de continuar.");
        return;
      }
    }

    if (isAgentePrintContracted()) {
      setCurrentStep(6);
      toast.success("Agora avalie as Etiquetas Padrões UNO ERP.");
    } else {
      setCurrentStep(3);
      toast.success("Avaliação concluída! Confira o resumo.");
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handlePluginsPrevious = () => {
    setCurrentStep(2);
    setCurrentModuleIndex(modules.length - 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleUpdatePlugin = (pluginId: string, updates: Partial<PluginEvaluation>) => {
    setPluginEvaluations((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, ...updates } : p))
    );
  };

  const handleClearPlugins = () => {
    setPluginEvaluations(initPlugins());
    setPluginsContracted(null);
  };

  const handleUpdateLabel = (labelId: string, updates: Partial<LabelEvaluation>) => {
    setLabelEvaluations((prev) =>
      prev.map((l) => (l.id === labelId ? { ...l, ...updates } : l))
    );
  };

  const handleClearLabels = () => {
    setLabelEvaluations(initLabels());
  };

  const handleLabelsComplete = () => {
    const allFilled = labelEvaluations.every(
      (l) =>
        l.relevance > 0 &&
        l.adherence > 0 &&
        (l.adherence === 5 || l.adherenceNote.trim().length > 0)
    );
    if (!allFilled) {
      toast.error("Por favor, avalie todas as etiquetas antes de continuar.");
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "auto" });
    toast.success("Avaliação concluída! Confira o resumo.");
  };

  const handleLabelsPrevious = () => {
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleBackToEvaluation = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const calculateOverallAdherence = (mods: Module[]) => {
    const active = mods.filter((m) => m.willUse !== false);
    if (active.length === 0) return 0;
    return Math.round(
      (active.reduce((sum, m) => sum + m.adherence, 0) / (active.length * 5)) * 100
    );
  };

  const saveToSupabase = async (step?: number, moduleIdx?: number) => {
    if (!clientInfo) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const record = {
      user_id: user.id,
      client_name: clientInfo.clientName,
      meeting_date: clientInfo.meetingDate,
      consultant_name: clientInfo.consultantName,
      collaborator_name: clientInfo.collaboratorName || "",
      modules: modules as any,
      plugins_contracted: pluginsContracted,
      plugin_evaluations: pluginEvaluations as any,
      label_evaluations: labelEvaluations as any,
      saved_step: step ?? currentStep,
      saved_module_index: moduleIdx ?? currentModuleIndex,
      overall_adherence: calculateOverallAdherence(modules),
    };

    if (currentEvaluationId) {
      const { error } = await supabase
        .from("evaluations")
        .update(record)
        .eq("id", currentEvaluationId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("evaluations")
        .insert(record)
        .select("id")
        .single();
      if (error) throw error;
      setCurrentEvaluationId(data.id);
    }
  };

  const handleSave = async () => {
    if (!clientInfo) return;

    try {
      await saveToSupabase(3);
      toast.success("Avaliação salva com sucesso!", {
        description: "Você pode editá-la a qualquer momento.",
      });
      setCurrentStep(4);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar avaliação. Tente novamente.");
    }
  };

  const handleNewEvaluation = () => {
    setCurrentStep(1);
    setClientInfo(null);
    setCurrentModuleIndex(0);
    setCurrentEvaluationId(null);
    setPluginsContracted(null);
    setModules(createInitialModules());
    setPluginEvaluations(initPlugins());
    setLabelEvaluations(initLabels());
    toast.info("Nova avaliação iniciada!");
  };

  const handleLoadEvaluation = (evaluation: any) => {
    setCurrentEvaluationId(evaluation.id);
    setClientInfo(evaluation.clientInfo);
    setModules(evaluation.modules);
    if (evaluation.pluginsContracted !== undefined) setPluginsContracted(evaluation.pluginsContracted);
    if (evaluation.pluginEvaluations) setPluginEvaluations(evaluation.pluginEvaluations);
    if (evaluation.labelEvaluations) setLabelEvaluations(evaluation.labelEvaluations);
    const savedStep = evaluation.savedStep ?? 3;
    const savedModuleIdx = evaluation.savedModuleIndex ?? 0;
    setCurrentModuleIndex(savedModuleIdx);
    setCurrentStep(savedStep);
    toast.success("Avaliação carregada!");
  };

  const handleBackToHistory = () => {
    setCurrentStep(0);
  };

  const handleGoHome = async () => {
    try {
      await saveToSupabase(currentStep, currentModuleIndex);
      toast.info("Progresso salvo!");
    } catch (e) {
      console.error("Erro ao salvar progresso:", e);
    }
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <VideoBackground />
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {currentStep > 0 && currentStep < 4 && <StepIndicator currentStep={currentStep} totalSteps={4} />}
          {(currentStep === 5 || currentStep === 6) && <StepIndicator currentStep={3} totalSteps={4} />}

          {currentStep === 0 && (
            <EvaluationHistory
              onLoadEvaluation={handleLoadEvaluation}
              onNewEvaluation={handleNewEvaluation}
            />
          )}

          {currentStep === 1 && <ClientInfoForm onNext={handleClientInfoSubmit} />}

          {currentStep === 2 && (
            <ModuleEvaluation
              modules={modules}
              currentModuleIndex={currentModuleIndex}
              onUpdateModule={handleUpdateModule}
              onNext={handleNextModule}
              onPrevious={handlePreviousModule}
              onComplete={handleCompleteEvaluation}
              onGoHome={handleGoHome}
              totalModules={TOTAL_MODULES}
            />
          )}

          {currentStep === 5 && (
            <PluginsEvaluation
              plugins={pluginEvaluations}
              contracted={pluginsContracted}
              totalModules={TOTAL_MODULES}
              cnpjCount={clientInfo?.cnpjCount || 1}
              onUpdateContracted={setPluginsContracted}
              onUpdatePlugin={handleUpdatePlugin}
              onClearPlugins={handleClearPlugins}
              onNext={handlePluginsComplete}
              onPrevious={handlePluginsPrevious}
              onGoHome={handleGoHome}
            />
          )}

          {currentStep === 6 && (
            <LabelsEvaluation
              labels={labelEvaluations}
              onUpdateLabel={handleUpdateLabel}
              onClearLabels={handleClearLabels}
              onNext={handleLabelsComplete}
              onPrevious={handleLabelsPrevious}
              onGoHome={handleGoHome}
            />
          )}

          {currentStep === 3 && clientInfo && (
            <SummaryView
              modules={modules}
              clientInfo={clientInfo}
              pluginEvaluations={pluginEvaluations}
              labelEvaluations={labelEvaluations}
              onBack={handleBackToEvaluation}
              onSave={handleSave}
              onBackToHistory={handleBackToHistory}
            />
          )}

          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <div className="mb-8">
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-success-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">Avaliação Salva!</h2>
                <p className="text-muted-foreground text-lg">
                  Você pode visualizar e editar esta avaliação a qualquer momento.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleBackToHistory}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-lg font-medium transition-colors"
                >
                  Ver Histórico de Avaliações
                </button>
                <button
                  onClick={handleNewEvaluation}
                  className="w-full border border-border hover:bg-muted h-12 px-6 rounded-lg font-medium transition-colors"
                >
                  Iniciar Nova Avaliação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
