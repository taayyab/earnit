import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const showCtas = location.pathname === "/";

  return (
    <>
      {" "}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/earnedit_logo.webp"
                alt="EarnedIT"
                className="h-16 w-auto"
              />
              <div className="hidden md:flex flex-col">
                <span className="text-base sm:text-lg font-bold text-slate-800 leading-tight tracking-tight">
                  EarnedIT
                </span>
                <span className="text-xs text-slate-500 leading-tight">
                  Veteran Benefits Platform
                </span>
              </div>
            </Link>

            {/* Navigation */}
            {showCtas ? (
              <nav className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/Register"
                  className="inline-flex items-center justify-center bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold px-7 h-12 rounded-md transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
