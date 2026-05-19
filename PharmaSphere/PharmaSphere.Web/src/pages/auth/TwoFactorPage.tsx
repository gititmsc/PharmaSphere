// src/pages/auth/TwoFactorPage.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import logo from '@/assets/logo.png';
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";

import { useAuth } from "@/contexts/AuthContext";
import LoadingButton from "@/components/common/LoadingButton";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

// ─── Single OTP digit box ─────────────────────────────────────────────────────
interface DigitBoxProps {
  value: string;
  index: number;
  inputRef: React.RefObject<HTMLInputElement>;
  hasError: boolean;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

const DigitBox: React.FC<DigitBoxProps> = ({
  value,
  index,
  inputRef,
  hasError,
  onChange,
  onKeyDown,
  onPaste,
}) => {
  const theme = useTheme();

  return (
    <Box
      component="input"
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(index, e.target.value)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
        onKeyDown(index, e)
      }
      onPaste={onPaste}
      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
      sx={{
        width: { xs: 44, sm: 52 },
        height: { xs: 52, sm: 62 },
        textAlign: "center",
        fontSize: { xs: "1.4rem", sm: "1.6rem" },
        fontWeight: 700,
        fontFamily: "inherit",
        borderRadius: "10px",
        border: "2px solid",
        borderColor: hasError
          ? theme.palette.error.main
          : value
            ? theme.palette.primary.main
            : theme.palette.divider,
        outline: "none",
        bgcolor: hasError
          ? "rgba(211,47,47,0.04)"
          : value
            ? "rgba(21,101,192,0.05)"
            : theme.palette.background.paper,
        color: "text.primary",
        transition: "all 0.15s ease",
        cursor: "text",
        caretColor: theme.palette.primary.main,
        "&:focus": {
          borderColor: hasError
            ? theme.palette.error.main
            : theme.palette.primary.main,
          boxShadow: hasError
            ? `0 0 0 3px rgba(211,47,47,0.15)`
            : `0 0 0 3px rgba(21,101,192,0.15)`,
          bgcolor: hasError ? "rgba(211,47,47,0.04)" : "rgba(21,101,192,0.06)",
        },
      }}
    />
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    pendingTwoFactor,
    pendingEmail,
    isAuthenticated,
    verifyTwoFactor,
    resendTwoFactorCode,
    logout,
  } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [shakeError, setShakeError] = useState(false);

  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement>>>(
    Array.from({ length: CODE_LENGTH }, () =>
      React.createRef<HTMLInputElement>(),
    ),
  );

  // Redirect to login only if there's no pending 2FA session AND not authenticated.
  // Avoid redirecting here after successful verification — TwoFactorRoute handles that.
  useEffect(() => {
    if (!pendingTwoFactor && !isAuthenticated)
      navigate("/login", { replace: true });
  }, [pendingTwoFactor, isAuthenticated, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const focusBox = (index: number) => {
    inputRefs.current[index]?.current?.focus();
  };

  const handleChange = useCallback((index: number, raw: string) => {
    // Accept only digits
    const char = raw.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    setApiError(null);
    setShakeError(false);
    if (char && index < CODE_LENGTH - 1) focusBox(index + 1);
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          setDigits((prev) => {
            const next = [...prev];
            next[index] = "";
            return next;
          });
        } else if (index > 0) {
          focusBox(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusBox(index - 1);
      } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
        focusBox(index + 1);
      } else if (e.key === "Enter") {
        handleVerify();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, CODE_LENGTH);
      if (!pasted) return;
      const next = [...digits];
      pasted.split("").forEach((ch, i) => {
        if (i < CODE_LENGTH) next[i] = ch;
      });
      setDigits(next);
      const nextEmpty = next.findIndex((d) => !d);
      focusBox(nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty);
    },
    [digits],
  );

  const handleVerify = useCallback(async () => {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setApiError("Please enter all 6 digits.");
      setShakeError(true);
      focusBox(digits.findIndex((d) => !d));
      return;
    }
    setVerifying(true);
    setApiError(null);
    try {
      await verifyTwoFactor(code);
      enqueueSnackbar("Verified! Welcome to PharmaSphere.", {
        variant: "success",
        autoHideDuration: 3500,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      let msg = "Invalid or expired code. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setApiError(msg);
      setShakeError(true);
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => focusBox(0), 50);
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 5000 });
    } finally {
      setVerifying(false);
      setTimeout(() => setShakeError(false), 600);
    }
  }, [digits, verifyTwoFactor, navigate, enqueueSnackbar]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendTwoFactorCode();
      setCountdown(RESEND_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      setApiError(null);
      focusBox(0);
      enqueueSnackbar("A new verification code has been sent.", {
        variant: "success",
        autoHideDuration: 4000,
      });
    } catch {
      enqueueSnackbar("Failed to resend code. Please try again.", {
        variant: "error",
        autoHideDuration: 4000,
      });
    } finally {
      setResending(false);
    }
  };

  const handleBack = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isFilled = digits.every(Boolean);

  // Mask email for display: s***@domain.com
  const maskedEmail = pendingEmail
    ? pendingEmail.replace(
        /^(.{1,2})(.*)(@.*)$/,
        (_, a, b, c) => a + b.replace(/./g, "*") + c,
      )
    : "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <Stack alignItems="center" mb={3}>
          <Box
            component="img"
            src={logo}
            alt="PharmaSphere"
            sx={{
              width: { xs: 180, sm: 220 },
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 4px 24px rgba(56,142,60,0.10)",
          }}
        >
          {/* Icon + heading */}
          <Stack alignItems="center" spacing={2} mb={4}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1565C0 0%, #388E3C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(56,142,60,0.3)",
              }}
            >
              <MarkEmailReadOutlinedIcon sx={{ color: "#fff", fontSize: 36 }} />
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Check your email
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                We've sent a 6-digit verification code to
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color="primary.main"
                sx={{ mt: 0.25 }}
              >
                {maskedEmail}
              </Typography>
            </Box>
          </Stack>

          {/* Error */}
          {apiError && (
            <Alert
              severity="error"
              onClose={() => setApiError(null)}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "error.light",
              }}
            >
              {apiError}
            </Alert>
          )}

          {/* OTP digit inputs */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 1.5 },
              justifyContent: "center",
              mb: 3,
              // Shake animation on error
              "@keyframes shake": {
                "0%, 100%": { transform: "translateX(0)" },
                "20%": { transform: "translateX(-6px)" },
                "40%": { transform: "translateX(6px)" },
                "60%": { transform: "translateX(-4px)" },
                "80%": { transform: "translateX(4px)" },
              },
              animation: shakeError ? "shake 0.5s ease" : "none",
            }}
          >
            {digits.map((d, i) => (
              <DigitBox
                key={i}
                value={d}
                index={i}
                inputRef={inputRefs.current[i]}
                hasError={!!apiError}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              />
            ))}
          </Box>

          {/* Progress dots */}
          <Stack direction="row" justifyContent="center" spacing={0.75} mb={3}>
            {digits.map((d, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: d ? "primary.main" : "divider",
                  transition: "background-color 0.2s ease",
                }}
              />
            ))}
          </Stack>

          {/* Verify button */}
          <LoadingButton
            variant="contained"
            size="large"
            fullWidth
            loading={verifying}
            loadingText="Verifying…"
            onClick={handleVerify}
            disabled={!isFilled}
            disableElevation
            sx={{
              py: 1.7,
              fontSize: "1rem",
              borderRadius: 2.5,
              mb: 2,
            }}
          >
            Verify &amp; Sign in
          </LoadingButton>

          {/* Resend */}
          <Stack alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?
            </Typography>
            {countdown > 0 ? (
              <Typography variant="body2" color="text.secondary">
                Resend in{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  {countdown}s
                </Box>
              </Typography>
            ) : (
              <Button
                variant="text"
                size="small"
                onClick={handleResend}
                disabled={resending}
                startIcon={
                  resending ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : undefined
                }
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {resending ? "Sending…" : "Resend code"}
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Back link */}
        <Divider sx={{ my: 3 }} />
        <Box textAlign="center">
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={handleBack}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              background: "none",
            }}
          >
            <ArrowBackIcon fontSize="inherit" />
            Back to sign in
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default TwoFactorPage;
