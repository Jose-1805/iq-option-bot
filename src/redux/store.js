import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import iq_option from "../components/iq_option/redux/reducer";
import configuration from "../components/configuration/redux/reducer";

export default createStore(
    combineReducers({
        iq_option,
        configuration,
    }),
    applyMiddleware(thunk)
);
