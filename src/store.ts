import { createStore } from "redux";

const tokenStore = (
  state: string | null = null,
  action: { type: string; token?: string }
) => {
  switch (action.type) {
    case "SET":
      return (state = action.token || null);
    case "UNSET":
      return (state = null);
    default:
      return state;
  }
};

export const store = createStore(tokenStore);
