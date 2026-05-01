import { useEffect } from "react";

const MESSAGE = "You have unsaved changes. Leave this page?";

export function useUnsavedChangesPrompt(when: boolean) {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = MESSAGE;
      return MESSAGE;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const nextUrl = new URL(anchor.href, window.location.origin);
      const currentUrl = new URL(window.location.href);
      if (
        nextUrl.origin !== currentUrl.origin ||
        (nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash)
      ) {
        return;
      }

      if (!window.confirm(MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = () => {
      if (!window.confirm(MESSAGE)) {
        window.history.go(1);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [when]);

  return (navigate: () => void) => {
    if (!when || window.confirm(MESSAGE)) {
      navigate();
    }
  };
}
