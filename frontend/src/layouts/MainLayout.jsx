import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../user-authentication/components/Header/Header";
import Footer from "../user-authentication/components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./ErrorBoundary"; 
import "./MainLayout.css";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isFocusedFlow = ["/checkout", "/payment", "/order-confirmation"].some(path =>
    pathname.startsWith(path)
  );

  // 🔁 Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header minimal={isFocusedFlow} />

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>

      {isAuthPage ? (
        <footer className="u-minimal-footer">
          <div className="u-container u-text-center u-py-4 u-text-sm u-text-muted">
            © {new Date().getFullYear()} E4Everything — Please login or register to continue
          </div>
        </footer>
      ) : !isFocusedFlow ? (
        <Footer />
      ) : null}

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </>
  );
}
