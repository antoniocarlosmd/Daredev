import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoTransparent from "@/assets/logo-transparent.png";

import { ThemeToggle } from "./ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideBottomNav?: boolean;
}

const AppLayout = ({ children, title, hideBottomNav }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logoTransparent} alt="REACT" className="h-8 w-8 object-contain" />
            <span className="font-heading text-sm font-bold gold-text">{title || "REACT"}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">{children}</main>

      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
