import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import params from "../../../config/params";
import useIqOptionQueries from "./UseIqOptionQueries";
import useIqOptionRedux from "./UseIqOptionRedux";
import useIqOptionSubscriptions from "./UseIqOptionSubscriptions";
import useConfiguration from "../../configuration/hooks/UseConfiguration";
import useConfigurationRedux from "../../configuration/hooks/UseConfigurationRedux";

const useIqOption = () => {
    const last_active_value_id = useSelector(
        (state) => state.configuration.last_active_value_id
    );
    const last_active_value_id_ref = useRef(last_active_value_id);

    const last_active_id = useSelector(
        (state) => state.configuration.last_active_id
    );
    const last_active_id_ref = useRef(last_active_id);

    const actives = useSelector((state) => state.configuration.actives);
    const actives_ref = useRef(actives);

    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);
    const turbo_actives_ref = useRef(turbo_actives);

    const configuration_state = useSelector(
        (state) => state.configuration.configuration_state
    );
    const configuration_state_ref = useRef(configuration_state);

    const amount_groups = useSelector(
        (state) => state.configuration.amount_groups
    );
    const amount_groups_ref = useRef(amount_groups);

    const candle_size = useSelector((state) => state.configuration.candle_size);
    const candle_size_ref = useRef(candle_size);

    const pattern_length = useSelector(
        (state) => state.configuration.pattern_length
    );
    const pattern_length_ref = useRef(pattern_length);

    const demo_balance_id = useSelector(
        (state) => state.iq_option.demo_balance_id
    );
    const demo_balance_id_ref = useRef(demo_balance_id);

    const real_balance_id = useSelector(
        (state) => state.iq_option.real_balance_id
    );
    const real_balance_id_ref = useRef(real_balance_id);

    const account = useSelector((state) => state.configuration.account);
    const account_ref = useRef(account);

    const auto_start_operations = useSelector(
        (state) => state.configuration.auto_start_operations
    );
    const auto_start_operations_ref = useRef(auto_start_operations);

    useEffect(() => {
        last_active_id_ref.current = last_active_id;
    }, [last_active_id]);

    useEffect(() => {
        last_active_value_id_ref.current = last_active_value_id;
    }, [last_active_value_id]);

    useEffect(() => {
        actives_ref.current = actives;
    }, [actives]);

    useEffect(() => {
        turbo_actives_ref.current = turbo_actives;
    }, [turbo_actives]);

    useEffect(() => {
        configuration_state_ref.current = configuration_state;
    }, [configuration_state]);

    useEffect(() => {
        amount_groups_ref.current = amount_groups;
    }, [amount_groups]);

    useEffect(() => {
        candle_size_ref.current = candle_size;
    }, [candle_size]);

    useEffect(() => {
        pattern_length_ref.current = pattern_length;
    }, [pattern_length]);

    useEffect(() => {
        demo_balance_id_ref.current = demo_balance_id;
    }, [demo_balance_id]);

    useEffect(() => {
        real_balance_id_ref.current = real_balance_id;
    }, [real_balance_id]);

    useEffect(() => {
        account_ref.current = account;
    }, [account]);

    useEffect(() => {
        auto_start_operations_ref.current = auto_start_operations;
    }, [auto_start_operations]);

    const { setConfigurationState } = useConfigurationRedux();
    const operations = useRef({});
    const last_candles = useRef({});
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

    const {
        setConnectionState,
        setWs,
        setTime,
        setProfile,
        setTurboActives,
        setBinaryActives,
        setCommissionValue,
    } = useIqOptionRedux();
    const { getInitializationData, getCandles } = useIqOptionQueries(send);
    const { subscribeCandles, subscribeCommissionChanged } =
        useIqOptionSubscriptions(send);
    const { addValuesToActive, convertDataToStringValue } =
        useConfiguration(send);
    const {
        addValueToPattern,
        setLastActiveId,
        setPattern,
        addActiveValueData,
        setTradersMood,
    } = useConfigurationRedux();
    const ssid = useSelector((state) => state.iq_option.ssid);

    const ws = useSelector((state) => state.iq_option.ws);

    /**
     * Inicia conexión con websocket de IqOption
     */
    const connect = () => {
        if (!ws && ssid) {
            setConnectionState(params.connectionStates.connecting);
            setWs(new WebSocket("wss://iqoption.com/echo/websocket"));
        }
    };

    /**
     * Cierra la conexión con el websocket de IqOption
     */
    const disconnect = () => {
        if (ws) {
            setConnectionState(params.connectionStates.disconnecting);
            ws.close();
        }
    };

    /**
     * Se establecen valores necesarios al cerrarse la conexión del websocket
     *
     * @param {event} e
     */
    const onCloseWebsocketConnection = (e) => {
        setConfigurationState(params.configurationStates.no_applied);
        setConnectionState(params.connectionStates.disconnected);
        setTurboActives({});
        setBinaryActives({});
        setWs(null);
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
                        setTime(data.msg);
                        break;
                    case "profile":
                        setProfile(data.msg);
                        setConnectionState(params.connectionStates.connected);
                        break;

                    // Datos del sistema iniciados
                    case "initialization-data":
                        let binary = {};
                        //console.log(data.msg);
                        let keys = Object.keys(data.msg.binary.actives);
                        // Determina si se debe detener el proceso y consultar datos nuevamente
                        let start_break = false;
                        for (let i = 0; i < keys.length; i++) {
                            const binary_item =
                                data.msg.binary.actives[keys[i]];

                            if (
                                !binary_item.description ||
                                binary_item.description.length === 0
                            ) {
                                getInitializationData();
                                start_break = true;
                                break;
                            }

                            if (binary_item.enabled) {
                                binary[keys[i]] = binary_item;
                            }
                        }
                        if (!start_break) {
                            setBinaryActives(binary);

                            let turbo = {};
                            keys = Object.keys(data.msg.turbo.actives);
                            for (let i = 0; i < keys.length; i++) {
                                const turbo_item =
                                    data.msg.turbo.actives[keys[i]];
                                if (
                                    !turbo_item.description ||
                                    turbo_item.description.length === 0
                                ) {
                                    getInitializationData();
                                    start_break = true;
                                    break;
                                }

                                if (turbo_item.enabled) {
                                    turbo[keys[i]] = turbo_item;
                                }
                            }

                            if (!start_break) {
                                setTurboActives(turbo);
                                subscribeCommissionChanged("turbo-option");
                            }
                        }
                        break;

                    case "candle-generated":
                        // Si el activo actual está entre los activos seleccionados para operar
                        if (
                            parseInt(data.msg.active_id) in
                                actives_ref.current &&
                            configuration_state_ref.current ===
                                params.configurationStates.applied
                        ) {
                            if (auto_start_operations_ref.current) {
                                evaluateCandleForOperation(data.msg);
                            }
                            // El tiempo actual es el mismo del cierre de la vela
                            if (
                                data.msg.at.toString().substr(0, 10) ===
                                data.msg.to.toString().substr(0, 10)
                            ) {
                                const candle_preview =
                                    data.msg.active_id in last_candles.current
                                        ? last_candles.current[
                                              data.msg.active_id
                                          ]
                                        : null;
                                addActiveValueData(
                                    data.msg.active_id,
                                    convertDataToStringValue(
                                        data.msg,
                                        candle_preview
                                    )
                                );

                                addValueToPattern(
                                    data.msg.active_id,
                                    convertDataToStringValue(
                                        data.msg,
                                        candle_preview
                                    )
                                );

                                last_candles.current[data.msg.active_id] =
                                    data.msg;
                            } else {
                                // Si la vela está en curso y no hay un patrón para el activo
                                // y no hay nada en espera, se consulta el patrón actual
                                if (
                                    pattern_length_ref.current > 0 &&
                                    !last_active_id_ref.current &&
                                    actives_ref.current[data.msg.active_id]
                                        .pattern === ""
                                ) {
                                    //Determina que el activo queda a la espera de velas
                                    setLastActiveId(data.msg.active_id);
                                    getCandles(
                                        data.msg.active_id,
                                        candle_size_ref.current,
                                        data.msg.id -
                                            pattern_length_ref.current -
                                            1,
                                        data.msg.id
                                    );
                                }
                            }
                        } else if (
                            parseInt(data.msg.active_id) ===
                                parseInt(last_active_value_id_ref.current) &&
                            configuration_state_ref.current ===
                                params.configurationStates.applying
                        ) {
                            //El activo está esperando asignación de datos para comparar con el patrón
                            // Se quita la suscripción a las velas debido a que no se requieren más
                            // en el proceso de inicialización de datos
                            subscribeCandles(
                                data.msg.active_id,
                                candle_size_ref.current,
                                true
                            )();

                            //Se consultan grupos de datos de 1000 en 1000
                            for (
                                let i = 0;
                                i < amount_groups_ref.current;
                                i++
                            ) {
                                setTimeout(() => {
                                    getCandles(
                                        data.msg.active_id,
                                        candle_size_ref.current,
                                        data.msg.id - 999 * (i + 1),
                                        data.msg.id - 999 * i - 1
                                    );
                                }, 300 * i);
                            }
                        }
                        break;
                    case "candles":
                        // Si la cantidad de velas es la misma del patrón y se está a la espera de datos
                        // de patrón, se asigna un patrón de análisis nuevo
                        if (
                            /*parseInt(data.msg.candles.length) ===
                                parseInt(pattern_length) &&*/
                            last_active_id_ref.current &&
                            configuration_state_ref.current ===
                                params.configurationStates.applied
                        ) {
                            let new_pattern = "";

                            //Si no se ha asignado el último valor de la vela
                            if (
                                !(
                                    last_active_id_ref.current in
                                    last_candles.current
                                )
                            ) {
                                last_candles.current[
                                    last_active_id_ref.current
                                ] =
                                    data.msg.candles[
                                        data.msg.candles.length - 1
                                    ];
                            }

                            for (let i = 0; i < data.msg.candles.length; i++) {
                                const el = data.msg.candles[i];
                                new_pattern += convertDataToStringValue(
                                    el,
                                    i === 0 ? null : data.msg.candles[i - 1]
                                );
                            }
                            setPattern(last_active_id_ref.current, new_pattern);
                        } else if (
                            configuration_state_ref.current ===
                            params.configurationStates.applying
                        ) {
                            addValuesToActive(data.msg.candles);
                        }
                        break;
                    case "commission-changed":
                        setCommissionValue(
                            data.msg.active_id,
                            data.msg.instrument_type,
                            data.msg.commission.value
                        );
                        break;
                    case "option-opened":
                        console.log(data.msg);
                        const direction = data.msg.direction === "put" ? 0 : 2;
                        const queries =
                            (localStorage.getItem("queries")
                                ? localStorage.getItem("queries")
                                : "") +
                            "UPDATE operations SET " +
                            ("option_id=" + data.msg.option_id + ",") +
                            ("created_at=" + data.msg.created_at + ",") +
                            ("option_value=" + data.msg.value + ",") +
                            ("expiration=" +
                                data.msg.expiration_time +
                                "000,") +
                            ("profit_percentage=" +
                                (data.msg.profit_percent - 100)) +
                            " WHERE active_id = " +
                            data.msg.active_id +
                            " AND configuration_id = 1 AND option_type = 4 AND direction = " +
                            direction +
                            " AND option_id IS NULL;";
                        localStorage.setItem("queries", queries);
                        break;
                    case "option-closed":
                        console.log(data.msg.result, data.msg);
                        const result =
                            data.msg.result === "loose"
                                ? 0
                                : data.msg.result === "win"
                                ? 2
                                : 1;
                        const queries_final =
                            (localStorage.getItem("queries")
                                ? localStorage.getItem("queries")
                                : "") +
                            "UPDATE operations SET " +
                            ("result=" + result) +
                            " WHERE option_id = " +
                            data.msg.option_id +
                            ";";
                        localStorage.setItem("queries", queries_final);
                        break;
                    // Operaciones abiertas desde el actual websocket
                    case "order-placed-temp":
                        break;
                    case "order-changed":
                        break;
                    case "traders-mood-changed":
                    case "traders-mood":
                        setTradersMood(
                            data.msg.asset_id,
                            Math.round(data.msg.value * 100)
                        );
                        break;
                    default:
                        //console.log(data.name, data);
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
                setTimeout(() => {
                    getInitializationData();
                }, 2000);
            };

            ws.onclose = onCloseWebsocketConnection;

            ws.onmessage = onWebsocketMessage;

            ws.onerror = (e) => {
                setWs(null);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ws]);

    const startBinaryOption = (
        active_id,
        option_type = "turbo",
        direction,
        expiration
    ) => {
        if (
            (account_ref.current === "demo" && demo_balance_id_ref.current) ||
            (account_ref.current === "real" && real_balance_id_ref.current)
        ) {
            console.warn("Abriendo operación en " + account_ref.current);
            send({
                name: "sendMessage",
                msg: {
                    name: "binary-options.open-option",
                    version: "1.0",
                    body: {
                        user_balance_id:
                            account_ref.current === "demo"
                                ? demo_balance_id_ref.current
                                : real_balance_id_ref.current,
                        active_id: active_id,
                        option_type_id: option_type === "turbo" ? 3 : 1,
                        direction: direction,
                        expired: parseInt(expiration.toString().substr(0, 10)),
                        refund_value: 0,
                        price: 1,
                        value: 0,
                        profit_percent:
                            100 -
                            turbo_actives_ref.current[active_id].option.profit
                                .commission,
                    },
                },
            });
        } else {
            console.warn("DATOS DE CUENTA NO ASIGNADOS");
        }
    };

    const evaluateCandleForOperation = (candle) => {
        let current_date = new Date();
        let max_date = new Date();
        max_date.setTime(candle.to.toString().substr(0, 10) + "000");
        max_date.setSeconds(max_date.getSeconds() - 30);
        if (current_date.getTime() < max_date.getTime()) {
            let operation_exists = false;
            // No hay operaciones en el activo
            if (!(candle.active_id in operations.current)) {
                operations.current = Object.assign({}, operations.current, {
                    [candle.active_id]: {},
                });
            }

            const active_operations = operations.current[candle.active_id];
            // Ya se ha registrado la operación
            if (candle.to.toString().substr(0, 10) in active_operations) {
                operation_exists = true;
            }

            /**
             * Función para almacenar y ejecutar una operación
             *
             * @param {*} direction
             */
            const addOperation = (direction) => {
                startBinaryOption(
                    candle.active_id,
                    "turbo",
                    parseInt(direction) === 1 ? "call" : "put",
                    candle.to
                );
                operations.current = Object.assign({}, operations.current, {
                    [candle.active_id]: Object.assign({}, active_operations, {
                        [candle.to.toString().substr(0, 10)]: true,
                    }),
                });
            };

            if (!operation_exists) {
                const active_data = actives_ref.current[candle.active_id];

                if (active_data.current_operation.direction != null) {
                    // Se espera vela a la baja
                    if (
                        parseInt(active_data.current_operation.direction) === 0
                    ) {
                        // Se puede abrir la operación desde un punto mayor o igual al de apertura
                        if (candle.close >= candle.open) {
                            addOperation(0);
                        }
                        // Se espera vela estable
                    } else if (
                        parseInt(active_data.current_operation.direction) === 1
                    ) {
                        // Se puede abrir a la baja si el punto actual es mayor al de apertura
                        if (candle.close > candle.open) {
                            addOperation(0);
                            // Se puede abrir al alza si el punto actual es menor al de apertura
                        } else if (candle.close < candle.open) {
                            addOperation(1);
                        }
                        // Se espera vela al alza
                    } else if (
                        parseInt(active_data.current_operation.direction) === 2
                    ) {
                        // Se puede abrir la operación desde un punto inferior o igual al de apertura
                        if (candle.close <= candle.open) {
                            addOperation(1);
                        }
                    }
                }
            }
        }
    };

    return {
        ws,
        send,
        connect,
        disconnect,
        startBinaryOption,
    };
};

export default useIqOption;
