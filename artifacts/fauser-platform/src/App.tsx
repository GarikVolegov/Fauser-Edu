import { useEffect, useRef, lazy, Suspense } from "react";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/Landing";

// Authenticated pages are code-split: each becomes its own chunk loaded on
// demand, keeping the initial bundle small. Landing/NotFound stay eager.
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Registro = lazy(() => import("@/pages/Registro"));
const Classroom = lazy(() => import("@/pages/Classroom"));
const Calendario = lazy(() => import("@/pages/Calendario"));
const Comunicazioni = lazy(() => import("@/pages/Comunicazioni"));
const Messaggi = lazy(() => import("@/pages/Messaggi"));
const Orario = lazy(() => import("@/pages/Orario"));
const Profilo = lazy(() => import("@/pages/Profilo"));
const Giustificazioni = lazy(() => import("@/pages/Giustificazioni"));
const Colloqui = lazy(() => import("@/pages/Colloqui"));
const Libreria = lazy(() => import("@/pages/Libreria"));
const Tutoraggio = lazy(() => import("@/pages/Tutoraggio"));
const Admin = lazy(() => import("@/pages/Admin"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Diario = lazy(() => import("@/pages/Diario"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const Forum = lazy(() => import("@/pages/Forum"));
const Sondaggi = lazy(() => import("@/pages/Sondaggi"));
const UsciteDidattiche = lazy(() => import("@/pages/UsciteDidattiche"));
const Aule = lazy(() => import("@/pages/Aule"));
const Certificati = lazy(() => import("@/pages/Certificati"));
const Analytics = lazy(() => import("@/pages/Analytics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// A real publishable key is mandatory in production. In dev without a key the
// Vite config aliases `@clerk/react` to a local mock provider that ignores this
// value, so we fall back to a harmless placeholder to keep types non-null.
if (!clerkPubKey && import.meta.env.PROD) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const effectiveClerkPubKey = clerkPubKey ?? "pk_test_dev_mock_placeholder";

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(222 47% 11%)",
    colorForeground: "hsl(222 47% 11%)",
    colorMutedForeground: "hsl(215 16% 47%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-slate-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold tracking-tight text-slate-900",
    headerSubtitle: "text-sm text-slate-500",
    socialButtonsBlockButtonText: "font-medium text-slate-700",
    formFieldLabel: "text-sm font-medium text-slate-700",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",
    footerActionText: "text-slate-500",
    dividerText: "text-xs text-slate-500 uppercase tracking-wider",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldSuccessText: "text-green-600 text-sm",
    alertText: "text-sm text-slate-700",
    logoBox: "h-12 flex justify-center mb-6",
    logoImage: "h-full w-auto",
    socialButtonsBlockButton:
      "border-slate-200 hover:bg-slate-50 transition-colors h-11",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground h-11 transition-colors",
    formFieldInput:
      "h-10 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20",
    footerAction:
      "bg-slate-50 border-t border-slate-100 p-6 flex justify-center items-center gap-2",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border border-red-200 rounded-md p-3",
    otpCodeFieldInput:
      "border-slate-200 h-12 text-lg focus:border-primary focus:ring-1 focus:ring-primary/20",
    formFieldRow: "mb-4",
    main: "p-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
      <div className="z-10 w-full flex justify-center">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
      <div className="z-10 w-full flex justify-center">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
        />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (!isSignedIn) {
    return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={effectiveClerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bentornato",
            subtitle: "Accedi al tuo account",
          },
        },
        signUp: {
          start: {
            title: "Crea il tuo account",
            subtitle: "Unisciti alla piattaforma oggi",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <Switch>
            <Route path="/" component={HomeRedirect} />

            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            <Route path="/dashboard">
              <ProtectedRoute component={Dashboard} />
            </Route>

            <Route path="/registro">
              <ProtectedRoute component={Registro} />
            </Route>

            <Route path="/classroom">
              <ProtectedRoute component={Classroom} />
            </Route>

            <Route path="/calendario">
              <ProtectedRoute component={Calendario} />
            </Route>

            <Route path="/comunicazioni">
              <ProtectedRoute component={Comunicazioni} />
            </Route>

            <Route path="/messaggi">
              <ProtectedRoute component={Messaggi} />
            </Route>

            <Route path="/orario">
              <ProtectedRoute component={Orario} />
            </Route>

            <Route path="/giustificazioni">
              <ProtectedRoute component={Giustificazioni} />
            </Route>

            <Route path="/colloqui">
              <ProtectedRoute component={Colloqui} />
            </Route>

            <Route path="/libreria">
              <ProtectedRoute component={Libreria} />
            </Route>

            <Route path="/tutoraggio">
              <ProtectedRoute component={Tutoraggio} />
            </Route>

            <Route path="/profilo">
              <ProtectedRoute component={Profilo} />
            </Route>

            <Route path="/admin">
              <ProtectedRoute component={Admin} />
            </Route>

            <Route path="/quiz">
              <ProtectedRoute component={Quiz} />
            </Route>

            <Route path="/diario">
              <ProtectedRoute component={Diario} />
            </Route>

            <Route path="/portfolio">
              <ProtectedRoute component={Portfolio} />
            </Route>

            <Route path="/forum">
              <ProtectedRoute component={Forum} />
            </Route>

            <Route path="/sondaggi">
              <ProtectedRoute component={Sondaggi} />
            </Route>

            <Route path="/uscite">
              <ProtectedRoute component={UsciteDidattiche} />
            </Route>

            <Route path="/aule">
              <ProtectedRoute component={Aule} />
            </Route>

            <Route path="/certificati">
              <ProtectedRoute component={Certificati} />
            </Route>

            <Route path="/analytics">
              <ProtectedRoute component={Analytics} />
            </Route>

            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
