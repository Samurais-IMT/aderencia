import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SavedEvaluation {
  id: string;
  clientInfo: {
    clientName: string;
    meetingDate: string;
    consultantName: string;
    collaboratorName?: string;
  };
  modules: any[];
  savedAt: string;
}

interface ClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientsDialog = ({ open, onOpenChange }: ClientsDialogProps) => {
  const [clientFilter, setClientFilter] = useState("");
  const [consultantFilter, setConsultantFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const savedEvaluations: SavedEvaluation[] = JSON.parse(
    localStorage.getItem("savedEvaluations") || "[]"
  );

  const calculateAdherence = (modules: any[]) => {
    return Math.round(
      (modules.reduce((sum, m) => sum + m.adherence, 0) / (modules.length * 5)) * 100
    );
  };

  const filteredEvaluations = useMemo(() => {
    return savedEvaluations.filter((evaluation) => {
      const matchesClient = evaluation.clientInfo.clientName
        .toLowerCase()
        .includes(clientFilter.toLowerCase());
      const matchesConsultant = evaluation.clientInfo.consultantName
        .toLowerCase()
        .includes(consultantFilter.toLowerCase());
      const matchesDate = dateFilter
        ? evaluation.clientInfo.meetingDate === dateFilter
        : true;

      return matchesClient && matchesConsultant && matchesDate;
    });
  }, [savedEvaluations, clientFilter, consultantFilter, dateFilter]);

  const handleEdit = (evaluation: SavedEvaluation) => {
    // Salvar o ID da avaliação e marcar para abrir o resumo
    localStorage.setItem("loadEvaluationId", evaluation.id);
    localStorage.setItem("openSummary", "true");
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-card max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Avaliações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientFilter">Nome do Cliente</Label>
              <Input
                id="clientFilter"
                placeholder="Filtrar por cliente"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultantFilter">Nome do Consultor</Label>
              <Input
                id="consultantFilter"
                placeholder="Filtrar por consultor"
                value={consultantFilter}
                onChange={(e) => setConsultantFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Data da Última Análise</Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setClientFilter("");
                  setConsultantFilter("");
                  setDateFilter("");
                }}
                variant="outline"
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ações</TableHead>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Data Última Análise</TableHead>
                  <TableHead>Nome do Consultor</TableHead>
                  <TableHead className="text-right">Aderência Geral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(evaluation)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {evaluation.clientInfo.clientName}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(evaluation.clientInfo.meetingDate),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell>{evaluation.clientInfo.consultantName}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {calculateAdherence(evaluation.modules)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientsDialog;
