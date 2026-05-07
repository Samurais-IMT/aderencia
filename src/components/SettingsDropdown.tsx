import { useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClientsDialog from "./ClientsDialog";

const SettingsDropdown = () => {
  const navigate = useNavigate();
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isClientsDialogOpen, setIsClientsDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem("webhookUrl") || ""
  );

  const handleSaveWebhook = () => {
    localStorage.setItem("webhookUrl", webhookUrl);
    setIsWebhookDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card z-50">
          <DropdownMenuItem onClick={() => setIsWebhookDialogOpen(true)}>
            URL Webhook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsClientsDialogOpen(true)}>
            Histórico de Avaliações
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/email-test")}>
            Teste de E-mail
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Configurar URL Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook">URL Webhook</Label>
              <Input
                id="webhook"
                type="url"
                placeholder="https://exemplo.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveWebhook} className="w-full">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientsDialog open={isClientsDialogOpen} onOpenChange={setIsClientsDialogOpen} />
    </>
  );
};

export default SettingsDropdown;
