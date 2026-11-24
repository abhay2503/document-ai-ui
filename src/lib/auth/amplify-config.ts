"use client";

// Configures Amplify once (at module load) to talk to our existing Cognito
// User Pool. Only the User Pool is used — no Identity Pool, no client secret.
import { Amplify } from "aws-amplify";
// Finishes the Authorization Code + PKCE exchange when Cognito redirects back.
import "aws-amplify/auth/enable-oauth-listener";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        email: true,
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          // Must match the OpenID Connect scopes enabled on the App Client.
          scopes: ["openid", "email"],
          redirectSignIn: [process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN!],
          redirectSignOut: [process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT!],
          responseType: "code",
        },
      },
    },
  },
});
