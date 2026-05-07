import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === true) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <MailX className="h-6 w-6 text-primary" />
            Cancelar Inscrição
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Verificando...
            </div>
          )}
          {status === "valid" && (
            <>
              <p className="text-muted-foreground">
                Deseja cancelar o recebimento de e-mails do UNO Predict?
              </p>
              <Button onClick={handleUnsubscribe} variant="destructive">
                Confirmar cancelamento
              </Button>
            </>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
              <p>Inscrição cancelada com sucesso.</p>
            </div>
          )}
          {status === "already" && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10" />
              <p>Você já cancelou a inscrição anteriormente.</p>
            </div>
          )}
          {(status === "invalid" || status === "error") && (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <XCircle className="h-10 w-10" />
              <p>Link inválido ou expirado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
