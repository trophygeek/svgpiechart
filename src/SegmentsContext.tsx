import {createContext, Dispatch} from "react";

export type Segment = {
  key: string; outerText: string; innerText: string;
};

export type SegmentsContextType = {
  segments: Segment[];
  setSegments: Dispatch<React.SetStateAction<Segment[]>>;
  addSegment: (newSeg: Segment) => void;
  updateSegment: (index: number, seg: Segment) => void;
};

//     [
//     {outerText:"Item 1 title", innerText:"Item 1 description"},
//     {outerText:"Item 2 title", innerText:"Item 2 description"},],
export const SegmentsContext = createContext<SegmentsContextType | null>(null);

export const RandomKey = () => Math.round(Math.random() * 1000000).toString(16);
