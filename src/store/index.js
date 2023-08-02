import { configureStore } from '@reduxjs/toolkit';


import cartSlice from './reducers';

const Store = configureStore({
  reducer: {  cart: cartSlice.reducer },
});

export default Store;
