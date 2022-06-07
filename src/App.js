import { Provider } from "react-redux";
import store from "./redux/store";
import StartConnection from "./components/StartConnection";

function App() {
    return (
        <Provider store={store}>
            <StartConnection />
        </Provider>
    );
}

export default App;
