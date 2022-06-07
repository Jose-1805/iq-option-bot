import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import data from "./data/reducer";

export default createStore(
    combineReducers({
        data,
    }),
    applyMiddleware(thunk)
);
