"use client";
import { createContext, Dispatch, ReactNode, useReducer } from "react";
import { TPlurkReducerAction, TPlurkResponse } from "../types/plurks";

type TInitialState = {
  plurks: TPlurkResponse[];
  hasData: boolean;
  selectedPlurksIds: number[];
  scrollToId: number | null;
};

const initialState = {
  plurks: [],
  hasData: false,
  selectedPlurksIds: [],
  scrollToId: null,
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
    case "SELECT_PLURKS_IDS":
      const temp = new Set(state.selectedPlurksIds);

      for (const id of action.payload) {
        if (temp.has(id)) {
          temp.delete(id);
        } else {
          temp.add(id);
        }
      }

      return {
        ...state,
        selectedPlurksIds: Array.from(temp),
      };
    case "SCROLL_TO_ID":
      return {
        ...state,
        scrollToId: action.payload,
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
