"use client";
import { createContext, Dispatch, useReducer } from "react";
import { TPlurkReducerAction, TPlurkResponse } from "../types/plurks";

type TInitialState = {
  plurks: TPlurkResponse[];
};

const initialState = {
  plurks: [],
};

export const PlurksDataContext = createContext<
  [TInitialState, Dispatch<TPlurkReducerAction>]
>([initialState, (() => {}) as Dispatch<TPlurkReducerAction>]);

const reducer = (
  state: TInitialState,
  action: TPlurkReducerAction
): TInitialState => {
  switch (action.type) {
    case "SET_PLURKS":
      return { ...state, plurks: action.payload };
    default:
      return state;
  }
};

export const PlurksDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <PlurksDataContext value={[state, dispatch]}>{children}</PlurksDataContext>
  );
};
