"use client";
import { createContext, Dispatch, ReactNode, useReducer } from "react";
import { TPlurkReducerAction, TPlurkResponse } from "../types/plurks";

type TInitialState = {
  plurks: TPlurkResponse[];
  hasData: boolean;
};

const initialState = {
  plurks: [],
  hasData: false,
};

export const PlurksDataContext = createContext<
  [TInitialState, Dispatch<TPlurkReducerAction>]
>([initialState, () => {}]);

const reducer = (
  state: TInitialState,
  action: TPlurkReducerAction
): TInitialState => {
  switch (action.type) {
    case "SET_PLURKS":
      return {
        ...state,
        plurks: action.payload,
        hasData: action.payload.length > 0,
      };
    default:
      return state;
  }
};

export const PlurksDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PlurksDataContext value={[state, dispatch]}>{children}</PlurksDataContext>
  );
};
