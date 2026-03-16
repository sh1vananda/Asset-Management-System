import { useContext } from "react";
import { AppContext } from "./store";

export function useApp() {
  return useContext(AppContext);
}