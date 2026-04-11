import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  withGrid?: boolean;
  withGlow?: boolean;
}

export function SectionWrapper({ 
  children, 
  id, 
  className = "", 
  withGrid = false,
  withGlow = false
}: SectionWrapperProps) {
  return (
    <section id={id} className={`py-24 relative overflow-hidden ${className}`}>
      {withGrid && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 z-0 pointer-events-none" />
      )}
      
      {withGlow && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#06B6D4]/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none z-0" />
        </>
      )}
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {children}
      </div>
    </section>
  );
}
