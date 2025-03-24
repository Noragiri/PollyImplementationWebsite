"use client";

import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import Home from './home';

export default function App() {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
}