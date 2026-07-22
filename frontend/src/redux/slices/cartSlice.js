import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  subtotal: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Could not add to cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Could not update cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const toggleSaveForLater = createAsyncThunk(
  'cart/toggleSaveForLater',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${itemId}/save-for-later`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.subtotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items;
        state.subtotal = action.payload.subtotal;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        toast.success('Added to cart');
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
        toast.success('Item removed');
      })
      .addCase(toggleSaveForLater.fulfilled, (state, action) => {
        state.items = action.payload.cart.items;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
