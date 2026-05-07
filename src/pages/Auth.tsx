import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";

const RECAPTCHA_SITE_KEY = "6LdHk5osAAAAAKha5jOB-dZEVryOy_Lz1JIOOY7N";
const RESEND_TIMER = 90;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleRecaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if user is active
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_active")
          .eq("id", data.user.id)
          .single();
        
        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          toast.error("Sua conta está inativa. Entre em contato com o administrador.");
          setLoading(false);
          return;
        }

        toast.success("Login realizado com sucesso!");
        navigate("/");
      } else {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase());
        if (existing && existing.length > 0) {
          toast.error("Este e-mail já está em uso");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name.trim() },
          },
        });
        if (error) throw error;

        if (data.user && name.trim()) {
          await supabase.from("profiles").update({ name: name.trim() }).eq("id", data.user.id);
        }

        if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate("/");
        } else {
          // Fallback: try to sign in directly (auto-confirm enabled)
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            toast.success("Conta criada! Faça login para continuar.");
            setIsLogin(true);
          } else {
            toast.success("Conta criada com sucesso!");
            navigate("/");
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos.");
      return;
    }
    if (!captchaVerified) {
      toast.error("Complete a verificação 'Não sou um robô'.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (error) throw error;
      toast.success("E-mail verificado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setCountdown(RESEND_TIMER);
      toast.success("Novo código enviado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao reenviar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Link de redefinição enviado para seu e-mail!");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar link.");
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <VideoBackground />
        <div className="flex-1 flex items-center justify-center py-8 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <img src="/logo-uno-predict.svg" alt="UNO Predict" className="h-14 mx-auto mb-4" />
              <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Informe seu e-mail para receber o link de redefinição.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">E-mail</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Link de Redefinição"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Voltar ao login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <VideoBackground />
        <div className="flex-1 flex items-center justify-center py-8 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <img src="/logo-uno-predict.svg" alt="UNO Predict" className="h-14 mx-auto mb-4" />
              <CardTitle className="text-2xl">Verificação de E-mail</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Digite o código de 6 dígitos enviado para <strong>{email}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  hl="pt-BR"
                />
              </div>

              <Button
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={loading || otpCode.length !== 6 || !captchaVerified}
              >
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || loading}
                  className={`flex items-center gap-1 ${
                    countdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline cursor-pointer"
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reenviar código
                </button>
                {countdown > 0 && (
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatTime(countdown)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setShowOtp(false); setOtpCode(""); setCaptchaVerified(false); recaptchaRef.current?.reset(); }}
                className="w-full text-sm text-muted-foreground hover:underline"
              >
                Voltar ao cadastro
              </button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <VideoBackground />
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src="/logo-uno-predict.svg" alt="UNO Predict" className="h-14 mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="block w-full text-sm text-muted-foreground hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
