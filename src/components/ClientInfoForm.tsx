import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Building2 } from "lucide-react";
import { ClientInfo } from "@/types/adherence";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ClientInfoFormProps {
  onNext: (clientInfo: ClientInfo) => void;
}

const getBrasiliaDatetime = () => {
  const now = toZonedTime(new Date(), "America/Sao_Paulo");
  return format(now, "yyyy-MM-dd'T'HH:mm");
};

const ClientInfoForm = ({ onNext }: ClientInfoFormProps) => {
  const [clientName, setClientName] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [cnpjCount, setCnpjCount] = useState(1);
  const [meetingDate, setMeetingDate] = useState(getBrasiliaDatetime());
  const [consultantName, setConsultantName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", user.id)
          .single();
        if (profile) {
          setConsultantName(profile.name || profile.email);
        }
      }
    };
    fetchUserName();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    onNext({
      clientName,
      meetingDate,
      consultantName,
      collaboratorName,
      cnpjCount
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Formulário de Aderência UNO ERP</CardTitle>
          <CardDescription className="text-base">
            Bem-vindo! Vamos avaliar a aderência do UNO ERP aos processos do seu cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-base">
                Nome da Empresa *
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite o nome da empresa"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collaboratorName" className="text-base">
                Nome do Colaborador (Cliente)
              </Label>
              <Input
                id="collaboratorName"
                value={collaboratorName}
                onChange={(e) => setCollaboratorName(e.target.value)}
                placeholder="Nome do colaborador do cliente (opcional)"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpjCount" className="text-base">
                Quantos CNPJs a empresa possui?
              </Label>
              <Input
                id="cnpjCount"
                type="number"
                min={1}
                max={50}
                value={cnpjCount}
                onChange={(e) => setCnpjCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingDate" className="text-base">
                Data da Avaliação
              </Label>
              <Input
                id="meetingDate"
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={!clientName.trim()}
            >
              Iniciar Avaliação
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInfoForm;
