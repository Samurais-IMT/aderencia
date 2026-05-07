import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Send, Mail } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";

interface LogRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  sent: "bg-green-500 text-white",
  pending: "bg-yellow-500 text-black",
  failed: "bg-red-500 text-white",
  dlq: "bg-red-700 text-white",
  rate_limited: "bg-orange-500 text-black",
  suppressed: "bg-gray-500 text-white",
};

const EmailTest = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(data));
      setRecipient(session.user.email ?? "");
      setAuthChecked(true);
    })();
  }, [navigate]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("email_send_log")
      .select("*")
      .eq("template_name", "verification-test")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      toast.error("Falha ao buscar logs", { description: error.message });
    } else {
      setLogs(data as LogRow[]);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchLogs();
    // Realtime updates
    const channel = supabase
      .channel("email-test-logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_send_log" },
        () => fetchLogs()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleSend = async () => {
    if (!recipient) {
      toast.error("Informe um destinatário");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "verification-test",
          recipientEmail: recipient,
          idempotencyKey: `verification-test-${crypto.randomUUID()}`,
          templateData: {
            recipientName: recipient.split("@")[0],
            sentAt: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
          },
        },
      });
      if (error) throw error;
      toast.success("E-mail enfileirado", {
        description: "Acompanhe o status na tabela abaixo.",
        style: { background: "#fc984c", color: "#000" },
      });
      setTimeout(fetchLogs, 1500);
    } catch (e: any) {
      toast.error("Falha ao enviar", { description: e.message });
    } finally {
      setSending(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Acesso restrito</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Esta página é exclusiva para administradores.
            </p>
            <Button onClick={() => navigate("/")}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <VideoBackground />
      <div className="min-h-screen p-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Mail className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Teste de Envio de E-mail</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enviar e-mail de verificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatário</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="email@exemplo.com"
                />
                <p className="text-xs text-muted-foreground">
                  Domínio remetente: <strong>notify.unosolucoes.com.br</strong>
                </p>
              </div>
              <Button onClick={handleSend} disabled={sending} className="bg-primary text-black hover:bg-primary/90">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar e-mail de teste
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de envios (últimos 30)</CardTitle>
              <Button size="sm" variant="outline" onClick={fetchLogs} disabled={loadingLogs}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingLogs ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum envio ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4">Data</th>
                        <th className="py-2 pr-4">Destinatário</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Erro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {new Date(l.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                          </td>
                          <td className="py-2 pr-4">{l.recipient_email}</td>
                          <td className="py-2 pr-4">
                            <Badge className={statusStyles[l.status] ?? "bg-muted"}>{l.status}</Badge>
                          </td>
                          <td className="py-2 pr-4 text-xs text-red-600 max-w-xs truncate">
                            {l.error_message ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            ⚠️ O domínio <strong>notify.unosolucoes.com.br</strong> ainda pode estar com a verificação de DNS pendente.
            Enquanto isso, e-mails permanecem com status <em>pending</em> até a propagação concluir.
            Acompanhe em Cloud → Emails.
          </p>
        </div>
      </div>
    </>
  );
};

export default EmailTest;
