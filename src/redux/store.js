import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import iq_option from "./iq_option/reducer";
import bot_information from "./bot_information/reducer";

export default createStore(
    combineReducers({
        iq_option,
        bot_information,
    }),
    applyMiddleware(thunk)
);
