import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const navLinks = [
  { label: "Product", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "More",
    children: [
      { label: "Plugins", href: "/plugins" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Compare", href: "/compare" },
      { label: "About", href: "/about" },
      { label: "Docs", href: "/docs" },
    ],
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openLogin() {
    setAuthMode("login");
    setAuthModalOpen(true);
  }

  function openRegister() {
    setAuthMode("register");
    setAuthModalOpen(true);
  }

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.08] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center z-50 group">
            <img
              src="/whitelogonepalix.svg"
              alt="Nepalix"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    {link.label}
                    <motion.div
                      animate={{ rotate: megaOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl shadow-xl overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-white/5 ${
                    location === link.href
                      ? "text-cyan-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-white text-xs font-semibold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0F172A]/95 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Account
                      </Link>
                      <div className="border-t border-white/[0.06]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </button>
                <Link
                  href="/book-demo"
                  className="px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-px"
                  style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)" }}
                >
                  Book Demo
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden z-50 p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#070B14]/98 backdrop-blur-2xl pt-20 px-6 pb-8 flex flex-col overflow-y-auto"
          >
            <nav className="flex flex-col gap-1 flex-1">
              <Link
                href="/product"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Product
              </Link>
              <Link
                href="/solutions"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/plugins"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Plugins
              </Link>
              <Link
                href="/case-studies"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Case Studies
              </Link>
              <Link
                href="/compare"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Compare
              </Link>
              <Link
                href="/about"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                About
              </Link>
              <Link
                href="/docs"
                className="px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Docs
              </Link>
              <div className="h-px bg-white/10 my-4" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-red-400 rounded-xl hover:bg-red-400/5 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openRegister}
                    className="mt-2 w-full py-4 rounded-xl text-white font-semibold text-center text-lg"
                    style={{
                      background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                    }}
                  >
                    Create Account
                  </button>
                  <Link
                    href="/book-demo"
                    className="mt-2 w-full py-4 rounded-xl text-white font-semibold text-center text-lg border border-white/20"
                  >
                    Book Demo
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
