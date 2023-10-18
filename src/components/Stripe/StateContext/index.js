// import React,
// { createContext,
//   useContext,
//   useReducer }
//   from './node_modules/react';
import React, {createContext, useContext, useReducer} from "react";
import {initialState, reducer} from './reducer';

const StateContext = createContext();
export const StateProvider = ({children}) =>
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
export const useStateValue = () => useContext(StateContext);