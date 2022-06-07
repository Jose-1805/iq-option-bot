import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import params from "../config/params";
import useReducerActions from "./UseReducerActions";

const useIqOption = () => {
    const ws = useSelector((state) => state.data.ws);
    const ssid = useSelector((state) => state.data.ssid);
    const profile = useSelector((state) => state.data.profile);
    const demo_balance_id = useSelector((state) => state.data.demo_balance_id);
    const real_balance_id = useSelector((state) => state.data.real_balance_id);
    const connection_state = useSelector(
        (state) => state.data.connection_state
    );
    const operationsId = useRef({});
    const {
        actSetConnectionState,
        actSetWs,
        actSetProfile,
        actSetDemoBalanceId,
        actSetRealBalanceId,
    } = useReducerActions();

    /**
     * Inicia conexión con websocket de IqOption
     */
    const connect = () => {
        if (!ws && ssid) {
            actSetConnectionState(params.connectionStates.connecting);
            actSetWs(new WebSocket("wss://iqoption.com/echo/websocket"));
        }
    };

    /**
     * Cierra la conexión con el websocket de IqOption
     */
    const disconnect = () => {
        if (ws) {
            actSetConnectionState(params.connectionStates.disconnecting);
            ws.close();
        }
    };

    /**
     * Envía un mensaje a través del websocket
     *
     * @param {JSON} data
     */
    const send = (data) => {
        if (data && ws) {
            ws.send(JSON.stringify(data));
        }
    };

    /**
     * Inicio de datos de divisas
     */
    const initData = () => {
        const dataSend = {
            name: "sendMessage",
            msg: {
                name: "get-initialization-data",
                version: "3.0",
                body: {},
            },
        };

        send(dataSend);
    };

    /**
     * Se establecen valores necesarios al cerrarse la conexión del websocket
     *
     * @param {event} e
     */
    const onCloseWebsocketConnection = (e) => {
        actSetConnectionState(params.connectionStates.disconnected);
        actSetWs(null);
    };

    /**
     * Acciones a tomar al recibir un mensaje desde el websocket
     *
     * @param {event} e
     */
    const onWebsocketMessage = (e) => {
        if (e.data) {
            let data = JSON.parse(e.data);

            if (data.name !== "timeSync" && data.name !== "heartbeat") {
                switch (data.name) {
                    case "profile":
                        actSetProfile(data.msg);
                        actSetConnectionState(
                            params.connectionStates.connected
                        );
                        initData();
                        break;
                    // Operaciones abiertas desde el actual websocket
                    case "order-placed-temp":
                        operationsId.current = Object.assign(
                            {},
                            operationsId.current,
                            { [data.msg.id]: true }
                        );
                        console.log(data.name, data);
                        break;
                    case "order-changed":
                        if (operationsId.current[data.msg.id]) {
                            console.log(data.name, data.msg.avg_price);
                        }
                        break;
                    // Datos del sistema iniciados
                    case "initialization-data":
                        //console.log(data.name, data);
                        /*setActives(data.msg.turbo.actives, "turbo-option");
                        setActives(data.msg.binary.actives, "binary-option");*/
                        break;
                    case "candle-generated":
                        /*if(data.msg.active_id == 1)
				    				console.log(data.msg.active_id, data.msg.close);*/
                        break;
                    case "traders-mood-changed":
                    case "traders-mood":
                        //setTradeMood(data.msg);
                        break;
                    default:
                        //console.log(user.email);
                        console.log(data.name, data);
                        break;
                }
            }
        }
    };

    /**
     * Manejo del websocket una vez se ha iniciado la conexión
     */
    useEffect(() => {
        if (ws) {
            ws.onopen = () => {
                /*const sendData = {
				    "name": "authenticate",
				    "msg": {
				        "ssid": user.brokers[0].pivot.token,
				        "protocol": 3,
				        "session_id": ""
				    }
				}*/

                const sendData = {
                    name: "ssid",
                    msg: ssid,
                };

                send(sendData);
            };

            ws.onclose = onCloseWebsocketConnection;

            ws.onmessage = onWebsocketMessage;

            ws.onerror = (e) => {
                actSetWs(null);
            };
        }
    }, [ws]);

    /**
     * Asignación de identificador de cada tipo de cuenta
     */
    useEffect(() => {
        if (profile) {
            const keys = Object.keys(profile.balances);

            for (let i = 0; i < keys.length; i++) {
                const el = profile.balances[keys[i]];
                if (el.type === 4) {
                    actSetDemoBalanceId(el.id);
                } else if (el.type === 1) {
                    actSetRealBalanceId(el.id);
                }
            }
        }
    }, [profile]);

    return {
        send,
        connect,
        disconnect,
        connection_state,
        profile,
        demo_balance_id,
        real_balance_id,
    };
};

export default useIqOption;
