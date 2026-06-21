/**
 * Development-only mock of `@clerk/react`.
 *
 * Vite aliases `@clerk/react` to this module ONLY in dev when no
 * `VITE_CLERK_PUBLISHABLE_KEY` is set (see vite.config.ts). It supplies a
 * permanently signed-in mock user so the SPA runs locally with no Clerk keys.
 * Production builds never use this file — they import the real `@clerk/react`.
 *
 * The mock user id matches the backend dev fallback (`dev_user_local`) so both
 * tiers agree on identity.
 */
import type { ReactNode } from "react";

const DEV_USER = {
  id: "dev_user_local",
  firstName: "Dev",
  lastName: "User",
  fullName: "Dev User",
  username: "dev",
  imageUrl: "",
  primaryEmailAddress: { emailAddress: "dev@local" },
  emailAddresses: [{ emailAddress: "dev@local" }],
};

export function ClerkProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: DEV_USER.id,
    sessionId: "dev_session_local",
    orgId: null,
    getToken: async () => null,
    signOut: async () => {},
  };
}

export function useUser() {
  return { isLoaded: true, isSignedIn: true, user: DEV_USER };
}

export function useClerk() {
  return {
    user: DEV_USER,
    signOut: async () => {},
    openSignIn: () => {},
    openSignUp: () => {},
    // Pages subscribe to user changes; in dev the user is static, so just
    // return a no-op unsubscribe.
    addListener: (_cb: (payload: { user: typeof DEV_USER }) => void) => () => {},
  };
}

export function Show({
  when,
  children,
}: {
  when?: string;
  children?: ReactNode;
}) {
  // We are always "signed-in" in dev fallback mode.
  return when === "signed-out" ? null : <>{children}</>;
}

function DevAuthNotice() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#334155" }}>
      Dev mode: already authenticated as <strong>Dev User</strong>.
    </div>
  );
}

export function SignIn() {
  return <DevAuthNotice />;
}

export function SignUp() {
  return <DevAuthNotice />;
}
