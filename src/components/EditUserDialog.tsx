import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    name: string | null;
    roles: string[];
    is_active?: boolean;
  } | null;
  onSaved: () => void;
}

const EditUserDialog = ({ open, onOpenChange, user, onSaved }: EditUserDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const resetForm = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email);
      setRole(user.roles[0] || "user");
      setPassword("");
      setIsActive(user.is_active !== false);
    }
  };

  useState(() => { resetForm(); });

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && user) resetForm();
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const body: any = { userId: user.id };
      if (name.trim() !== (user.name || "")) body.name = name.trim();
      if (email !== user.email) body.email = email;
      if (password) body.password = password;

      const res = await supabase.functions.invoke("admin-update-user", {
        body,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      // Update role if changed
      const currentRole = user.roles[0] || "user";
      if (role !== currentRole) {
        await supabase.from("user_roles").delete().eq("user_id", user.id);
        await supabase.from("user_roles").insert({ user_id: user.id, role: role as any });
      }

      // Update active status
      if (isActive !== (user.is_active !== false)) {
        await supabase.from("profiles").update({ is_active: isActive } as any).eq("id", user.id);
      }

      toast.success("Usuário atualizado com sucesso!");
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReset = async () => {
    if (!user) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`E-mail de redefinição enviado para ${user.email}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar e-mail");
    } finally {
      setSendingReset(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do usuário" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="user-active">Usuário Ativo</Label>
            <Switch
              id="user-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Tabs defaultValue="change">
              <TabsList className="w-full">
                <TabsTrigger value="change" className="flex-1">Alterar senha</TabsTrigger>
                <TabsTrigger value="reset" className="flex-1">Enviar redefinição</TabsTrigger>
              </TabsList>
              <TabsContent value="change" className="mt-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  minLength={6}
                />
              </TabsContent>
              <TabsContent value="reset" className="mt-2">
                <Button onClick={handleSendReset} variant="outline" className="w-full" disabled={sendingReset}>
                  {sendingReset ? "Enviando..." : "Enviar e-mail de redefinição"}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
