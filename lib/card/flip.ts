export type Side = "front" | "back";

export interface FlipState {
  side: Side;
  reduced: boolean;
}

export type FlipAction = { type: "toggle" } | { type: "motion"; reduced: boolean };

export const initialFlip: FlipState = { side: "front", reduced: false };

export function flipReducer(state: FlipState, action: FlipAction): FlipState {
  switch (action.type) {
    case "toggle":
      return { ...state, side: state.side === "front" ? "back" : "front" };
    case "motion":
      return { ...state, reduced: action.reduced };
  }
}

/** The accessible name of the flip button: it names what pressing does (§23). */
export function flipLabel(side: Side): string {
  return side === "front"
    ? "Flip card: show Tushar Pathak contact and links"
    : "Flip card: show the front of Tushar Pathak's business card";
}
