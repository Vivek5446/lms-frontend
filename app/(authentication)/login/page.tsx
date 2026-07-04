"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthLayout } from "../../../components/auth/AuthLayout";
import { OtpInput } from "../../../components/auth/OtpInput";
import { StepDots } from "../../../components/auth/StepDots";

import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";

const DUMMY_OTP = "123456";

type Step = "phone" | "otp";

const LoginPage = observer(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, openNotification, requestOtp } = stores.auth;
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const wasRegistered = searchParams.get("registered") === "1";
  const redirectTarget = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (wasRegistered) {
      openNotification({
        title: "Account created",
        message: "Sign in with your phone number and OTP to continue.",
        type: "success",
      });
    }
  }, [openNotification, wasRegistered]);

  useEffect(() => {
    if (!resendIn) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleRequestOtp = async () => {
    const normalizedPhone = phone.trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      openNotification({ title: "Check your phone number", message: "Enter a valid 10-digit phone number.", type: "error" });
      return;
    }
    setSending(true);
    try {
      await requestOtp({ phone: normalizedPhone, purpose: "login" });
      setStep("otp");
      setOtp("");
      setResendIn(30);
      openNotification({ title: "OTP sent", message: `Use ${DUMMY_OTP} while dummy flow is on.`, type: "success" });
    } catch (error: any) {
      openNotification({ title: "Unable to send OTP", message: error?.message || error?.error || "We could not start the login flow.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const normalizedOtp = otp.trim();
    const normalizedPhone = phone.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      openNotification({ title: "Check your OTP", message: "Enter the 6-digit OTP.", type: "error" });
      return;
    }
    setVerifying(true);
    try {
      const response: any = await login({ phone: normalizedPhone, otp: normalizedOtp });
      openNotification({ title: "Signed in", message: response?.message || "Welcome back.", type: "success", duration: 3000 });
      router.replace(redirectTarget || getDefaultAuthenticatedRoute(stores.auth.user || { userType: response?.data?.userType, role: response?.data?.role }));
    } catch (error: any) {
      openNotification({ title: "Login failed", message: error?.message || error?.error || "Unable to verify that OTP.", type: "error" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure sign-in"
      title="Welcome back. Pick up right where you left off."
      subtitle="Sign in with a phone number and one-time passcode — no passwords to remember."
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-7"
      >
        <div className="flex items-center justify-between">
          <NextLink
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </NextLink>
          <StepDots total={2} current={step === "phone" ? 0 : 1} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> OTP protected
          </div>
          <h1 className="font-display text-2xl sm:text-3xl leading-[1.05] text-foreground font-bold">
            {step === "phone" ? "Sign in" : "Verify it's you"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "phone"
              ? "We'll text you a one-time code to confirm this number."
              : (
                <>
                  Enter the 6-digit code sent to <span className="font-semibold text-foreground">+91 {phone}</span>.
                </>
              )}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestOtp();
              }}
              className="space-y-5"
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-foreground/80">
                  Phone number
                </span>
                <div className="group relative flex items-center rounded-2xl border border-input bg-zinc-50 dark:bg-zinc-800/50 transition-all focus-within:border-primary focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-4 focus-within:ring-primary/15">
                  <div className="pl-4 pr-2 flex items-center gap-2 border-r border-border/70 h-14">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-sm font-semibold text-foreground/80">+91</span>
                  </div>
                  <Phone className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="min-w-0 flex-1 bg-transparent px-3 h-14 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </label>

              <PrimaryButton loading={sending} disabled={!phone}>
                Send OTP <ArrowRight className="h-4 w-4" />
              </PrimaryButton>

              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <a className="text-foreground underline underline-offset-2">Terms</a> &{" "}
                <a className="text-foreground underline underline-offset-2">Privacy</a>.
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-5"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground/80 inline-flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> One-time code
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Change number
                  </button>
                </div>
                <OtpInput value={otp} onChange={setOtp} autoFocus />
              </div>

              <PrimaryButton loading={verifying} disabled={otp.length !== 6}>
                {otp.length === 6 ? (
                  <>
                    Verify & continue <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>Enter 6-digit code</>
                )}
              </PrimaryButton>

              <div className="text-center text-xs text-muted-foreground">
                Didn't receive it?{" "}
                {resendIn > 0 ? (
                  <span>Resend in {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <NextLink href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : "/register"} className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Create an account
          </NextLink>
        </div>
      </motion.div>
    </AuthLayout>
  );
});

export default LoginPage;

function PrimaryButton({
  children,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type="submit"
      disabled={disabled || loading}
      className="relative w-full rounded-2xl bg-primary text-primary-foreground font-semibold text-sm h-[52px] shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>{children}</>
      )}
    </motion.button>
  );
}
