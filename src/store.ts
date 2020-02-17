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

const LOCAL_KEY = "gitwordsToken";
const localStore = localStorage.getItem(LOCAL_KEY);
const persistedState = localStore ? JSON.parse(localStore) : null;

const store = createStore(tokenStore, persistedState);
store.subscribe(() => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store.getState()));
});

export { store };
