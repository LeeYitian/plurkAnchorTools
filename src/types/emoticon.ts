import { DEFAULT_EMOTICONS } from "./constants";
import { TPlurkResponse } from "./plurks";

export type Emoticon = keyof typeof DEFAULT_EMOTICONS;

export type GetSearchPlurksType = {
  plurks: TPlurkResponse[];
  plurkId: string;
  iconName: string;
  raw?: string;
};

export type GetSameEmoticonType = {
  plurks: TPlurkResponse[];
  plurkId: string;
  iconName: string;
  rndnum: string[];
  raw: string;
};

export type GetLargeSmallEmoticonType = {
  plurks: TPlurkResponse[];
  plurkId: string;
  iconName: string;
  rndnum: string[];
  raw: string;
  mode: "large" | "small";
};

export type GetWinLoseEmoticonType = {
  plurks: TPlurkResponse[];
  plurkId: string;
  iconName: string;
  rndnum: string[];
  mode: "win" | "lose";
};
