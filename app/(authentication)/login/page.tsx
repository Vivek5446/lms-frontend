"use client";

import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthLayout } from "../../../components/auth/AuthLayout";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { getDefaultAuthenticatedRoute } from "../../config/utils/roleAccess";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";

type Step = "phone" | "otp";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const LoginPage = observer(() => {
  const searchParams = useSearchParams();
  const { login, openNotification, requestOtp } = stores.auth;
  const requestedRedirect = String(searchParams.get("redirect") || "").trim();
  const wasRegistered = searchParams.get("registered") === "1";
  const redirectTarget =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpValue, setOtpValue] = useState(""); // single string e.g. "123456"
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wasRegistered) {
      openNotification({
        title: "Account created",
        message: "Sign in with your phone number and OTP to continue.",
        type: "success",
      });
    }
  }, [openNotification, wasRegistered]);

  // Focus phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const handleRequestOtp = async () => {
    const normalizedPhone = phone.trim();
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setErrorText("INVALID NUMBER");
      return;
    }
    setLoading(true);
    setErrorText("");
    try {
      const res = await requestOtp({ phone: normalizedPhone, purpose: "login" });
      if (res?.data?.token) setToken(res.data.token);
      setOtpValue("");
      setStep("otp");
    } catch (error: any) {
      const msg =
        error?.message || error?.error || error?.response?.data?.message || "UNABLE TO SEND OTP";
      setErrorText(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    const normalizedPhone = phone.trim();
    setLoading(true);
    setErrorText("");
    try {
      const response: any = await login({
        phone: normalizedPhone,
        otp: code,
        token: token || undefined,
      });
      setIsUnlocked(true);
      setTimeout(() => {
        window.location.href =
          redirectTarget ||
          getDefaultAuthenticatedRoute(
            stores.auth.user || {
              userType: response?.data?.userType,
              role: response?.data?.role,
            }
          );
      }, 1500);
    } catch (error: any) {
      const msg =
        error?.message || error?.error || error?.response?.data?.message || "INVALID OTP";
      setErrorText(msg.toUpperCase());
      setTimeout(() => {
        setErrorText("");
        setOtpValue("");
        otpInputRef.current?.focus();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const otpDigits = Array.from({ length: 6 }, (_, i) => otpValue[i] ?? "");

  const newUserLink = (
    <div className="text-center text-[10px] font-bold text-black/40 dark:text-white/40">
      <NextLink
        href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : "/register"}
        className="uppercase tracking-widest hover:text-primary dark:hover:text-white transition-colors"
      >
        New User? Create Account
      </NextLink>
    </div>
  );

  /* ── PHONE STEP ── */
  if (step === "phone") {
    const actionBtn = (
      <button
        onClick={handleRequestOtp}
        disabled={phone.length !== 10 || loading}
        className={cn(
          "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all duration-300",
          "bg-gradient-to-r from-primary to-[#ff4d6d] text-white shadow-[0_10px_20px_rgba(var(--primary),0.2)] hover:shadow-[0_15px_30px_rgba(var(--primary),0.3)] hover:-translate-y-0.5",
          phone.length === 10 ? "opacity-100" : "opacity-40 pointer-events-none"
        )}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SEND OTP <CheckCircle2 className="w-3.5 h-3.5" /></>}
      </button>
    );

    return (
      <AuthLayout mobileFooter={newUserLink} mobileAction={actionBtn}>
        <div className="flex justify-between items-center mb-6">
          <NextLink
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-primary dark:text-white/60 dark:hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </NextLink>
          <p className="text-[10px] font-[900] uppercase tracking-[0.3em] text-black/70 dark:text-white/70">
            Welcome Back
          </p>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-start border-b-[1.5px] pb-1.5 transition-all duration-500 border-black/20 focus-within:border-primary dark:border-white/20 dark:focus-within:border-primary mt-2">
          <span className="text-xl font-semibold mr-3 text-black/60 dark:text-white/40">+91</span>
          <input
            ref={phoneInputRef}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && phone.length === 10) {
                e.preventDefault();
                handleRequestOtp();
              }
            }}
            className="bg-transparent border-none outline-none font-semibold text-2xl w-full text-black placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
            placeholder="0000000000"
            disabled={loading}
          />
        </div>

        {errorText && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{errorText}</p>
          </div>
        )}

        <div className="mt-8 hidden sm:block">
          {actionBtn}
        </div>

        <div className="hidden sm:block mt-6">{newUserLink}</div>
      </AuthLayout>
    );
  }

  /* ── OTP STEP ── */
  const actionBtn = (
    <button
      onClick={() => handleVerify(otpValue)}
      disabled={otpValue.length !== 6 || loading}
      className={cn(
        "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all duration-300",
        "bg-gradient-to-r from-primary to-[#ff4d6d] text-white shadow-[0_10px_20px_rgba(var(--primary),0.2)] hover:shadow-[0_15px_30px_rgba(var(--primary),0.3)] hover:-translate-y-0.5",
        otpValue.length === 6 ? "opacity-100" : "opacity-40 pointer-events-none"
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>VERIFY OTP <CheckCircle2 className="w-3.5 h-3.5" /></>}
    </button>
  );

  return (
    <AuthLayout mobileFooter={newUserLink} mobileAction={actionBtn}>
      <button
        onClick={() => { setStep("phone"); setOtpValue(""); setErrorText(""); }}
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-primary dark:text-white/60 dark:hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Change Number
      </button>

      <p className={cn(
        "text-[1.2rem] sm:text-[15px] font-[900] uppercase tracking-widest leading-tight",
        errorText ? "text-red-500" : isUnlocked ? "text-green-500" : "text-black dark:text-white"
      )}>
        {isUnlocked ? "SIGN IN SUCCESSFUL" : errorText ? "INVALID CODE" : "VERIFY IT'S YOU"}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] mt-2 text-black/50 dark:text-white/50">
        Enter the 6-digit OTP sent to +91 {phone}
      </p>

      {/* Single input + 6 visual boxes */}
      <div
        className="relative flex justify-between gap-2 mt-8 cursor-text"
        onClick={() => otpInputRef.current?.focus()}
      >
        {/* The real input — transparent text/caret so it's invisible but fully interactive */}
        <input
          ref={otpInputRef}
          autoFocus
          type="tel"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otpValue}
          maxLength={6}
          onChange={(e) => {
            if (isUnlocked || loading) return;
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtpValue(val);
            setErrorText("");
            if (val.length === 6) handleVerify(val);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            opacity: 1,
            color: "transparent",
            caretColor: "transparent",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "16px",
            letterSpacing: "0",
          }}
        />

        {/* 6 visual boxes */}
        {otpDigits.map((digit, i) => {
          const isActive = i === otpValue.length && !isUnlocked && !loading;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 aspect-[4/5] rounded-xl flex items-center justify-center font-mono text-xl font-bold border-2 transition-all duration-150 pointer-events-none select-none",
                errorText
                  ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : isUnlocked
                  ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/20"
                  : digit
                  ? "border-primary bg-primary/5 text-black dark:bg-primary/10 dark:text-white"
                  : isActive
                  ? "border-primary/60 bg-white dark:bg-white/5"
                  : "border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
              )}
            >
              {digit || (isActive ? (
                <span className="w-[2px] h-5 bg-primary rounded-full" style={{ animation: "blink 1s step-end infinite" }} />
              ) : null)}
            </div>
          );
        })}
      </div>

      {errorText && (
        <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{errorText}</p>
        </div>
      )}

      {loading && (
        <div className="mt-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      <div className="hidden sm:block mt-8">
        {actionBtn}
      </div>

      <div className="hidden sm:block mt-6">{newUserLink}</div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </AuthLayout>
  );
});

export default LoginPage;
