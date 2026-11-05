import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useCurrentUser = () => useAppSelector((s) => s.auth.user);
export const useCart = () => useAppSelector((s) => s.cart);
export const useCartCount = () => useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));
export const useIsStaff = () => useAppSelector((s) => s.auth.user?.role === "admin" || s.auth.user?.role === "staff");
