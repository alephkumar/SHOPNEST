import { createSlice } from '@reduxjs/toolkit';

const storedTheme = localStorage.getItem('shopnest_theme') || 'light';

const initialState = {
  mobileMenuOpen: false,
  cartDrawerOpen: false,
  theme: storedTheme,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    closeCartDrawer: (state) => {
      state.cartDrawerOpen = false;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('shopnest_theme', state.theme);
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleCartDrawer,
  closeCartDrawer,
  toggleTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
