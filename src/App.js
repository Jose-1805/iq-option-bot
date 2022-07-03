import { Provider } from "react-redux";
import Start from "./components/Start";
import store from "./redux/store";

function App() {
    return (
        <Provider store={store}>
            <Start />
        </Provider>
    );
}

export default App;
