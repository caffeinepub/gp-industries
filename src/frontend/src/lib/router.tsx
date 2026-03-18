/**
 * Lightweight in-house router (replaces react-router-dom dependency)
 * Compatible with the same API used across the app.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface LocationState {
  pathname: string;
}

const LocationCtx = createContext<LocationState>({ pathname: "/" });
const NavigateCtx = createContext<(to: string, replace?: boolean) => void>(
  () => {},
);

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string, replace?: boolean) => {
    if (replace) {
      window.history.replaceState(null, "", to);
    } else {
      if (window.location.pathname !== to) {
        window.history.pushState(null, "", to);
      }
    }
    setPathname(to);
  }, []);

  return (
    <LocationCtx.Provider value={{ pathname }}>
      <NavigateCtx.Provider value={navigate}>{children}</NavigateCtx.Provider>
    </LocationCtx.Provider>
  );
}

export function useLocation(): LocationState {
  return useContext(LocationCtx);
}

export function useNavigate(): (to: string) => void {
  return useContext(NavigateCtx);
}

export function Link({
  to,
  children,
  className,
  style,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export function Route(_props: RouteProps): React.ReactNode {
  return null;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const routes: RouteProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props) {
      const props = child.props as RouteProps;
      routes.push({ path: props.path, element: props.element });
    }
  });

  const exact = routes.find((r) => r.path === pathname);
  if (exact) return <>{exact.element}</>;

  const wildcard = routes.find((r) => r.path === "*");
  if (wildcard) return <>{wildcard.element}</>;

  return null;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useContext(NavigateCtx);
  const calledRef = useRef(false);
  if (!calledRef.current) {
    calledRef.current = true;
    // Schedule synchronously before paint
    Promise.resolve().then(() => navigate(to, replace));
  }
  return null;
}
