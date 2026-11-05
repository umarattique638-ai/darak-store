import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserDTO } from "@/types/api";

interface AuthState {
  user: UserDTO | null;
}

const initialState: AuthState = { user: null };

/** The signed-in user. Tokens are NEVER stored here — they live in httpOnly cookies. */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDTO | null>) => {
      state.user = action.payload;
    },
    loggedOut: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, loggedOut } = authSlice.actions;
export default authSlice.reducer;
