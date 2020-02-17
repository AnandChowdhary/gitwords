import { createStore } from "redux";

export interface RootState {
  token?: string;
  files?: any[];
}
const appStore = (state: RootState = {}, action: any) => {
  if (action.type === "SET") {
    state.token = action.token;
  } else if (action.type === "UNSET") {
    state.token = undefined;
  } else if (action.type === "FILES") {
    state.files = action.files;
  }
  return state;
};

const LOCAL_KEY = "gitwordsToken";
const localStore = localStorage.getItem(LOCAL_KEY);
const persistedState = localStore ? JSON.parse(localStore) : {};

const store = createStore(appStore, persistedState);
store.subscribe(() => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store.getState()));
});

export { store };
