export type TPlurkResponse = {
  id: number;
  user_id: number;
  plurk_id: number;
  content_raw: string;
  qualifier: string;
  posted: string;
  lang: string;
  content: string;
  last_edited: string | null;
  coins: null;
  handle: string;
  my_anonymous: boolean;
  with_random_emos: boolean;
  editability: number;
};
export type TPlurk = {
  responses_seen: number;
  response_count: number;
  has_older: number;
  has_newer: number;
  users: unknown;
  responses: TPlurkResponse[];
};

export type TPlurkReducerAction =
  | {
      type: "SET_PLURKS";
      payload: TPlurkResponse[];
    }
  | { type: "SELECT_PLURKS_IDS"; payload: number[] };
