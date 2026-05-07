import { useState, useEffect, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { Trash2, Edit, FileText, Search, Shield, ClipboardList, Filter, X, CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import SettingsDropdown from "./SettingsDropdown";
import UserAvatar from "./UserAvatar";
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
} from "@/components/ui/alert-dialog";

interface SavedEvaluation {
  id: string;
  userId: string;
  clientInfo: {
    clientName: string;
    meetingDate: string;
    consultantName: string;
    collaboratorName: string;
  };
  modules: any[];
  pluginsContracted?: boolean | null;
  pluginEvaluations?: any[];
  labelEvaluations?: any[];
  savedAt: string;
  savedStep?: number;
  savedModuleIndex?: number;
}

interface EvaluationHistoryProps {
  onLoadEvaluation: (evaluation: SavedEvaluation) => void;
  onNewEvaluation: () => void;
}

const EvaluationHistory = ({ onLoadEvaluation, onNewEvaluation }: EvaluationHistoryProps) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [evaluations, setEvaluations] = useState<SavedEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();

  const fetchEvaluations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar avaliações:", error);
      toast.error("Erro ao carregar avaliações.");
    } else {
      // Fetch profile names for user_ids
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      const profileMap = new Map<string, string>();
      (profiles || []).forEach((p: any) => {
        profileMap.set(p.id, p.name || p.email);
      });

      const mapped: SavedEvaluation[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        clientInfo: {
          clientName: row.client_name,
          meetingDate: row.meeting_date,
          consultantName: profileMap.get(row.user_id) || row.consultant_name,
          collaboratorName: row.collaborator_name || "",
        },
        modules: row.modules || [],
        pluginsContracted: row.plugins_contracted,
        pluginEvaluations: row.plugin_evaluations || [],
        labelEvaluations: row.label_evaluations || [],
        savedAt: row.updated_at,
        savedStep: row.saved_step,
        savedModuleIndex: row.saved_module_index,
      }));
      setEvaluations(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvaluations();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      setIsAdmin(!!(roles && roles.length > 0));
    }
  };

  const uniqueConsultants = useMemo(() => {
    const names = new Set(evaluations.map((e) => e.clientInfo.consultantName));
    return Array.from(names).sort();
  }, [evaluations]);

  const activeFilterCount = (selectedConsultants.length > 0 ? 1 : 0) + (selectedDate ? 1 : 0);

  const filteredEvaluations = evaluations
    .filter((e) => {
      if (searchFilter) {
        const term = searchFilter.toLowerCase();
        if (!e.clientInfo.clientName.toLowerCase().includes(term)) return false;
      }
      if (selectedConsultants.length > 0) {
        if (!selectedConsultants.includes(e.clientInfo.consultantName)) return false;
      }
      if (selectedDate) {
        const meetingDate = new Date(e.clientInfo.meetingDate);
        if (!isSameDay(meetingDate, selectedDate)) return false;
      }
      return true;
    })
    .slice(0, 50);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("evaluations").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir avaliação.");
    } else {
      toast.success("Avaliação excluída.");
      fetchEvaluations();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const calculateAdherence = (modules: any[]) => {
    const activeModules = modules.filter(m => m.willUse !== false);
    if (activeModules.length === 0) return 0;
    return Math.round(
      (activeModules.reduce((sum: number, m: any) => sum + m.adherence, 0) / (activeModules.length * 5)) * 100
    );
  };

  const toggleConsultant = (name: string) => {
    setSelectedConsultants((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const clearFilters = () => {
    setSelectedConsultants([]);
    setSelectedDate(undefined);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-4">
          <img src="/logo-uno-predict.svg" alt="UNO Predict" className="h-16 w-auto" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Histórico de Avaliações</h2>
            <p className="text-muted-foreground">
              Gerencie suas avaliações anteriores
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 flex-wrap items-center">
        <Button onClick={onNewEvaluation} className="w-full sm:w-auto">
          + Nova Avaliação
        </Button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por cliente..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtros</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs text-muted-foreground">
                    <X className="w-3 h-3 mr-1" /> Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 border-b space-y-3">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Consultor</h5>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {uniqueConsultants.map((name) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedConsultants.includes(name)}
                      onCheckedChange={() => toggleConsultant(name)}
                    />
                    {name}
                  </label>
                ))}
                {uniqueConsultants.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum consultor encontrado</p>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data da reunião</h5>
                {selectedDate && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="h-auto p-1 text-xs text-muted-foreground">
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className={cn("p-0 pointer-events-auto")}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Badge variant="secondary" className="h-10 px-4 flex items-center gap-2 text-sm whitespace-nowrap">
          <ClipboardList className="h-4 w-4" />
          {filteredEvaluations.length} avaliações
        </Badge>
        <SettingsDropdown />
        {isAdmin && (
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/users")} title="Gerenciar Usuários">
            <Shield className="w-4 h-4" />
          </Button>
        )}
        <UserAvatar />
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Carregando avaliações...</p>
        </Card>
      ) : filteredEvaluations.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma avaliação salva</h3>
          <p className="text-muted-foreground mb-6">
            Comece criando sua primeira avaliação
          </p>
          <Button onClick={onNewEvaluation}>Iniciar Avaliação</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvaluations.map((evaluation) => (
            <Card key={evaluation.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-1">{evaluation.clientInfo.clientName}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(evaluation.clientInfo.meetingDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Consultor: {evaluation.clientInfo.consultantName}
                </p>
                {evaluation.clientInfo.collaboratorName && (
                  <p className="text-sm text-muted-foreground">
                    Colaborador: {evaluation.clientInfo.collaboratorName}
                  </p>
                )}
              </div>

              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Aderência Geral</p>
                <p className="text-2xl font-bold text-primary">
                  {calculateAdherence(evaluation.modules)}%
                </p>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Salvo em: {format(toZonedTime(new Date(evaluation.savedAt), "America/Sao_Paulo"), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => onLoadEvaluation(evaluation)}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(evaluation.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationHistory;
