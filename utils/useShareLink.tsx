import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

export const NO_SHARE_LINK = "NO_SHARE_LINK";
export const UNKNOWN_SHARE_LINK = "UNKNOWN_SHARE_LINK";

function getShareLink() {
  if (typeof document === "undefined") {
    return UNKNOWN_SHARE_LINK;
  }
  if (typeof URLSearchParams === "undefined") {
    return UNKNOWN_SHARE_LINK;
  }

  const params = new URLSearchParams(document.location.search);
  const shareData = params.get("share");
  if (!shareData) {
    return NO_SHARE_LINK;
  }
  try {
    const decodedShareData = atob(shareData);
    const parsedShareData = new URLSearchParams(decodedShareData);
    return parsedShareData;
  } catch (e) {
    return NO_SHARE_LINK;
  }
}

function makeUrl(path: string, search: string, hash: string): string {
  return `${path}${search.length > 0 ? `?${search}` : ""}${hash}`;
}

function clearShareLinkFromUrl() {
  if (typeof document === "undefined") {
    return;
  }
  if (typeof URLSearchParams === "undefined") {
    return;
  }

  const params = new URLSearchParams(document.location.search);
  params.delete("share");
  window.history.replaceState(
    null,
    "",
    makeUrl(
      document.location.pathname,
      params.toString(),
      document.location.hash,
    ),
  );
}

type ClearShareLinkFunc = () => void;

type ShareLinkData = URLSearchParams | "NO_SHARE_LINK" | "UNKNOWN_SHARE_LINK";
const ShareContext = createContext<{
  shareLinkData: ShareLinkData;
  clearShareLink: ClearShareLinkFunc;
}>({
  shareLinkData: UNKNOWN_SHARE_LINK,
  clearShareLink: () => {},
});

export function ShareLinkManager({ children }: { children: ReactNode }) {
  const [shareLink, setShareLink] = useState<ShareLinkData>(UNKNOWN_SHARE_LINK);

  useEffect(() => {
    const newShareLink = getShareLink();
    if (shareLink !== newShareLink) {
      setShareLink(getShareLink);
    }
  }, []);

  function clearShareLink() {
    clearShareLinkFromUrl();
    setShareLink(NO_SHARE_LINK);
  }

  return (
    <ShareContext.Provider
      value={{
        shareLinkData: shareLink,
        clearShareLink,
      }}
    >
      {children}
    </ShareContext.Provider>
  );
}

export default function useShareLink(): {
  shareLinkData: ShareLinkData;
  clearShareLink: ClearShareLinkFunc;
} {
  return useContext(ShareContext);
}
