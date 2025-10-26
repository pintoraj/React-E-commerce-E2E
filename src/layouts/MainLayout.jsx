import { Outlet, useLocation } from "react-router-dom";
import Header from "../user-authentication/components/Header/Header";
import Footer from "../user-authentication/components/Footer/Footer";
import "./MainLayout.css";

export default function MainLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isFocusedFlow = ["/checkout", "/payment", "/order-confirmation"].some(path =>
    pathname.startsWith(path)
  );

  return (
    <>
      {/* Pass minimal prop to Header for focused pages */}
      <Header minimal={isFocusedFlow} />

      <main>
        <Outlet />
      </main>

      {/* Footer logic */}
      {isAuthPage ? (
        <footer className="u-minimal-footer">
          <div className="u-container u-text-center u-py-4 u-text-sm u-text-muted">
            © {new Date().getFullYear()} E4Everything — Please login or register to continue
          </div>
        </footer>
      ) : !isFocusedFlow ? (
        <Footer />
      ) : null}
    </>
  );
}
