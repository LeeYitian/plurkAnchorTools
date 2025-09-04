"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

export const LoadingContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(false);

  return (
    <LoadingContext.Provider value={[state, setState]}>
      {children}
    </LoadingContext.Provider>
  );
};
