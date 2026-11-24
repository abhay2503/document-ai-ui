"use client";

import "@aws-amplify/ui-react/styles.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, ThemeProvider, type Theme } from "@aws-amplify/ui-react";
import { useAuth } from "@/components/auth/auth-provider";

// Match the Amplify UI colours/corners to the DocuMind purple theme.
const theme: Theme = {
  name: "documind",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: "oklch(0.96 0.03 290)" },
          20: { value: "oklch(0.92 0.06 290)" },
          40: { value: "oklch(0.75 0.14 285)" },
          60: { value: "oklch(0.62 0.2 284)" },
          80: { value: "oklch(0.53 0.235 283)" },
          90: { value: "oklch(0.47 0.235 283)" },
          100: { value: "oklch(0.42 0.22 283)" },
        },
      },
    },
    radii: {
      small: { value: "0.5rem" },
      medium: { value: "0.75rem" },
      large: { value: "1rem" },
    },
    fonts: {
      default: {
        variable: { value: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" },
        static: { value: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" },
      },
    },
  },
};

/** Amplify's ready-made sign in / sign up / verify / forgot-password screens. */
export function LoginView({ initialState }: { initialState: "signIn" | "signUp" }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Once signed in, go to the DocuMind app.
  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  return (
    <ThemeProvider theme={theme}>
      <Authenticator
        initialState={initialState}
        loginMechanisms={["email"]}
        // The user pool requires these at sign-up.
        signUpAttributes={["name", "email", "phone_number"]}
        formFields={{
          signUp: {
            name: { label: "Full name", placeholder: "Enter your full name", order: 1 },
            email: { order: 2 },
            phone_number: { dialCode: "+91", order: 3 },
            password: { order: 4 },
            confirm_password: { order: 5 },
          },
        }}
      >
        {() => <p className="text-center text-sm text-muted-foreground">Signing you in…</p>}
      </Authenticator>
    </ThemeProvider>
  );
}
