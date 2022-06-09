import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import params from "../../config/params";
import useIqOptionActions from "./UseIqOptionActions";
import useBotInformation from "../bot_information/UseBotInformation";
import useBotInformationActions from "../bot_information/UseBotInformationActions";
import useIqOptionQueries from "./UseIqOptionQueries";

const useIqOption = () => {
    const ws = useSelector((state) => state.iq_option.ws);
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
    const active_id = useSelector((state) => state.bot_information.active_id);
    const active_id_ref = useRef(active_id);
    const ssid = useSelector((state) => state.iq_option.ssid);
    const profile = useSelector((state) => state.iq_option.profile);
    const { getInitializationData } = useIqOptionQueries();
    const demo_balance_id = useSelector(
        (state) => state.iq_option.demo_balance_id
    );
    const real_balance_id = useSelector(
        (state) => state.iq_option.real_balance_id
    );
    const connection_state = useSelector(
        (state) => state.iq_option.connection_state
    );
    const operationsId = useRef({});
    const {
        actSetConnectionState,
        actSetWs,
        actSetTime,
        actSetProfile,
        actSetDemoBalanceId,
        actSetRealBalanceId,
        actSetTurboActives,
        actSetBinaryActives,
    } = useIqOptionActions();
    const { addValueToPattern, loadCandles, convertDataToStringValue } =
        useBotInformation(send);
    const { actSetLastCandleId, actSetPattern } = useBotInformationActions();
    const last_candle_id = useSelector(
        (state) => state.bot_information.last_candle_id
    );
    const pattern_length = useSelector(
        (state) => state.bot_information.pattern_length
    );
    const last_candle_id_ref = useRef(last_candle_id);

    useEffect(() => {
        active_id_ref.current = active_id;
    }, [active_id]);

    /**
     * Al cargar el primer identificador de vela se cargan las velas anteriores para
     * definir el patrón actual
     */
    useEffect(() => {
        if (last_candle_id && !last_candle_id_ref.current) {
            loadCandles(pattern_length);
        }
        last_candle_id_ref.current = last_candle_id;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [last_candle_id]);

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
     * Se establecen valores necesarios al cerrarse la conexión del websocket
     *
     * @param {event} e
     */
    const onCloseWebsocketConnection = (e) => {
        actSetConnectionState(params.connectionStates.disconnected);
        actSetTurboActives({});
        actSetBinaryActives({});
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

            if (data.name !== "heartbeat") {
                switch (data.name) {
                    case "timeSync":
                        actSetTime(data.msg);
                        break;
                    case "profile":
                        actSetProfile(data.msg);
                        actSetConnectionState(
                            params.connectionStates.connected
                        );
                        break;

                    // Datos del sistema iniciados
                    case "initialization-data":
                        let binary = {};
                        let keys = Object.keys(data.msg.binary.actives);
                        let start_break = false;
                        for (let i = 0; i < keys.length; i++) {
                            const binary_item =
                                data.msg.binary.actives[keys[i]];

                            if (binary_item.description === "") {
                                getInitializationData();
                                start_break = true;
                                break;
                            }

                            if (binary_item.enabled) {
                                binary[keys[i]] = binary_item;
                            }
                        }
                        if (!start_break) {
                            actSetBinaryActives(binary);

                            let turbo = {};
                            keys = Object.keys(data.msg.turbo.actives);
                            for (let i = 0; i < keys.length; i++) {
                                const turbo_item =
                                    data.msg.turbo.actives[keys[i]];
                                if (turbo_item.description === "") {
                                    getInitializationData();
                                    start_break = true;
                                    break;
                                }

                                if (turbo_item.enabled) {
                                    turbo[keys[i]] = turbo_item;
                                }
                            }

                            !start_break && actSetTurboActives(turbo);
                        }
                        break;

                    case "candle-generated":
                        // Activo es el mismo seleccionado para análisis
                        if (
                            parseInt(active_id_ref.current) ===
                            parseInt(data.msg.active_id)
                        ) {
                            //console.log("ASIGNANDO ID", data.msg.id);
                            actSetLastCandleId(data.msg.id);
                            // El tiempo actual es el mismo del cierre de la vela
                            if (
                                data.msg.to.toString().substr(0, 10) ===
                                data.msg.at.toString().substr(0, 10)
                            ) {
                                addValueToPattern(data.msg);
                            }
                        }
                        break;
                    case "candles":
                        // Si la cantidad de velas es la misma del patrón, se asigna
                        // un patrón de análisis nuevo
                        if (data.msg.candles.length === pattern_length) {
                            let new_pattern = "";
                            for (let i = 0; i < data.msg.candles.length; i++) {
                                const el = data.msg.candles[i];
                                new_pattern += convertDataToStringValue(el);
                            }
                            actSetPattern(new_pattern);
                        }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
