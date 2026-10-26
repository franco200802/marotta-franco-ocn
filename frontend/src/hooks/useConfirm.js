import { useContext } from "react";
import { ConfirmContext } from "../context/confirmContext.js";

export function useConfirm() {
  const confirmar = useContext(ConfirmContext);
  if (!confirmar) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>.");
  return confirmar;
}
