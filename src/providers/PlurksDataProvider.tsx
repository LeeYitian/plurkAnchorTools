"use client";
import { createContext, Dispatch, ReactNode, useReducer } from "react";
import { TPlurkReducerAction, TPlurkResponse } from "../types/plurks";

type TInitialState = {
  plurks: TPlurkResponse[];
  plurk_id: number;
  hasData: boolean;
  hasEditedPlurks: boolean;
  selectedPlurksIds: number[];
  scrollToId: number | null;
  editedPlurks: Record<string, string>;
};

const initialState = {
  plurks: [],
  plurk_id: 0,
  hasData: false,
  hasEditedPlurks: false,
  selectedPlurksIds: [],
  scrollToId: null,
  editedPlurks: {},
};

export const PlurksDataContext = createContext<
  [TInitialState, Dispatch<TPlurkReducerAction>]
>([initialState, () => {}]);

const reducer = (
  state: TInitialState,
  action: TPlurkReducerAction,
): TInitialState => {
  switch (action.type) {
    case "SET_PLURKS":
      // isSamePlurk：使用者重新載入同一則噗文時（例如手動重整），
      // 保留既有的勾選狀態和編輯內容，不要清空。
      // 若換了不同的噗文，則清空，避免舊資料殘留在新噗文的畫面上。
      const isSamePlurk =
        state.plurks[0]?.plurk_id === action.payload[0]?.plurk_id;
      return {
        ...state,
        plurks: action.payload,
        plurk_id: action.payload[0]?.plurk_id || 0,
        hasData: action.payload.length > 0,
        selectedPlurksIds: isSamePlurk ? state.selectedPlurksIds : [],
        editedPlurks: isSamePlurk ? state.editedPlurks : {},
      };
    case "SELECT_PLURKS_IDS":
      // Toggle 邏輯：已選 → 取消，未選 → 加入，用 Set 確保不重複
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
    case "SET_PLURKS_IDS":
      return {
        ...state,
        selectedPlurksIds: action.payload,
      };
    case "SCROLL_TO_ID":
      return {
        ...state,
        scrollToId: action.payload,
      };
    case "SET_EDITED_PLURKS":
      const hasEditedPlurks =
        Object.keys({ ...state.editedPlurks, ...action.payload }).length > 0;
      return {
        ...state,
        hasEditedPlurks,
        editedPlurks: { ...state.editedPlurks, ...action.payload },
      };
    case "RESTORE_EDITED_PLURKS":
      const id = action.payload;
      const newObj = { ...state.editedPlurks };
      delete newObj[id];
      return {
        ...state,
        editedPlurks: newObj,
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
