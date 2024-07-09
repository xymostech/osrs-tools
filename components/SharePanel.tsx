import { useState, useEffect } from "react";
import { FiCopy, FiDownload } from "react-icons/fi";

import Popup from "@/components/Popup";
import useShareLink, {
  UNKNOWN_SHARE_LINK,
  NO_SHARE_LINK,
} from "@/utils/useShareLink";

export default function SharePanel({
  generateShareLinkData,
  saveStates,
}: {
  generateShareLinkData: () => Map<string, string> | null;
  saveStates: () => void;
}) {
  const [copied, setCopied] = useState<boolean>(false);
  const [recentlySaved, setRecentlySaved] = useState<boolean>(false);
  const { shareLinkData, clearShareLink } = useShareLink();

  useEffect(() => {
    if (copied) {
      const timeoutRef = setTimeout(() => {
        setCopied(false);
      }, 10 * 1000);
      return () => clearTimeout(timeoutRef);
    }
  }, [copied]);

  useEffect(() => {
    if (recentlySaved) {
      const timeoutRef = setTimeout(() => {
        setRecentlySaved(false);
      }, 3 * 1000);
      return () => clearTimeout(timeoutRef);
    }
  }, [recentlySaved]);

  function generateShareLink() {
    const shareLinkData = generateShareLinkData();
    if (!shareLinkData) {
      return "";
    }

    const data = Array.from(shareLinkData.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return document.location + `?share=${btoa(data)}`;
  }

  async function copyShareLink() {
    const shareLink = generateShareLink();

    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
    }
  }

  function saveShareLink() {
    saveStates();
    clearShareLink();
    setRecentlySaved(true);
  }

  if (shareLinkData === UNKNOWN_SHARE_LINK) {
    return <div />;
  } else if (shareLinkData === NO_SHARE_LINK && !recentlySaved) {
    return (
      <>
        <Popup
          key="share-setup"
          placement="bottom-end"
          popup={
            <div className="max-w-[300px] p-2 text-black bg-white border-2 rounded border-slate-600">
              <div className="pb-2">
                Copy this share link and send it to others to copy your setup:
              </div>
              <div className="flex flex-row items-center">
                <input
                  type="text"
                  className="min-w-0 p-1 border border-slate-500"
                  readOnly
                  size={0}
                  onClick={(e) => e.currentTarget.select()}
                  value={generateShareLink()}
                />
                <div className="w-2" />
                <button
                  className="flex flex-row items-center border border-slate-400 rounded p-1 hover:bg-slate-200 active:bg-slate-400"
                  onClick={copyShareLink}
                >
                  <FiCopy />
                  <div className="w-1" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          }
        >
          <div className="h-full cursor-pointer flex flex-row items-center">
            Share your setup
          </div>
        </Popup>
        <div className="w-4" />
      </>
    );
  } else {
    return (
      <>
        <Popup
          key="save-setup"
          startOpen
          placement="bottom-end"
          popup={
            <div className="max-w-[290px] p-2 text-black bg-white border-2 rounded border-slate-600">
              <div className="pb-2">
                You are viewing a setup that someone shared with you. Changes
                you make will not be saved yet.
              </div>
              <div className="flex flex-row items-center">
                Save the shared setup to your browser:
                <div className="w-2" />
                <button
                  className="flex flex-row items-center border border-slate-400 rounded px-2 py-1 hover:bg-slate-200 active:bg-slate-400"
                  onClick={saveShareLink}
                >
                  <FiDownload />
                  <div className="w-1" />
                  {recentlySaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          }
        >
          <div className="h-full cursor-pointer flex flex-row items-center">
            <div className="bg-violet-700 hover:bg-violet-800 px-2 py-1 rounded">
              Viewing a shared setup
            </div>
          </div>
        </Popup>
        <div className="w-4" />
      </>
    );
  }
}
