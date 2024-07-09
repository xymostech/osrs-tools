import React, { useState, useEffect } from "react";

import useShareLink, {
  NO_SHARE_LINK,
  UNKNOWN_SHARE_LINK,
} from "./useShareLink";

function readLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(key);
  if (value == null) {
    return null;
  }

  return JSON.parse(value) as T;
}

function setLocalStorage<T>(key: string, newValue: T) {
  window.localStorage.setItem(key, JSON.stringify(newValue));
}

// Typescript can't seem to figure out that s is a function on its own by
// typeof, so this is a type guard to help it out
function isSetStateFunction<T>(
  s: React.SetStateAction<T>,
): s is (prevState: T) => T {
  return typeof s === "function";
}

function readStorageKeyWithDefault<T>(
  localStorageKey: string,
  defaultValue: T,
  updateOldValue?: (oldState: T) => T,
) {
  const value = readLocalStorage<T>(localStorageKey);
  if (value) {
    if (updateOldValue) {
      return updateOldValue(value);
    } else {
      return value;
    }
  } else {
    return defaultValue;
  }
}

export default function useLocalStorageState<T>(
  localStorageKey: string,
  defaultValue: T,
  parseShareLink?: (share: URLSearchParams) => T,
  updateOldValue?: (oldState: T) => T,
): [T, (newState: React.SetStateAction<T>) => void, () => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [loadedFromShareLink, setLoadedFromShareLink] =
    useState<boolean>(false);

  const { shareLinkData } = useShareLink();
  const hasShareLink =
    shareLinkData !== NO_SHARE_LINK && shareLinkData !== UNKNOWN_SHARE_LINK;

  useEffect(() => {
    if (!hasShareLink) {
      setState(
        readStorageKeyWithDefault(
          localStorageKey,
          defaultValue,
          updateOldValue,
        ),
      );
    }
  }, [localStorageKey, defaultValue, updateOldValue, shareLinkData]);

  useEffect(() => {
    if (loadedFromShareLink) {
      return;
    }
    if (hasShareLink && parseShareLink) {
      setState(parseShareLink(shareLinkData));
      setLoadedFromShareLink(true);
    }
  }, [parseShareLink, shareLinkData, loadedFromShareLink]);

  return [
    state,
    (newState) => {
      setState(newState);
      if (!hasShareLink) {
        if (isSetStateFunction(newState)) {
          setLocalStorage(localStorageKey, newState(state));
        } else {
          setLocalStorage(localStorageKey, newState);
        }
      }
    },
    () => {
      setLocalStorage(localStorageKey, state);
    },
  ];
}
