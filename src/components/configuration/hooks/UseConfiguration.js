import { useSelector } from "react-redux";
import params from "../../../config/params";
import useIqOptionSubscriptions from "../../iq_option/hooks/UseIqOptionSubscriptions";
import useConfigurationRedux from "./UseConfigurationRedux";
import { useEffect, useRef } from "react";
import useIqOptionQueries from "../../iq_option/hooks/UseIqOptionQueries";

const useConfiguration = (send) => {
    const {
        setConfigurationState,
        setLastActiveValueId,
        addActiveValues,
        addActiveVolumes,
        setPatternAnalysis,
        setPatternLength,
    } = useConfigurationRedux();
    const { subscribeCandles, subscribeTradersMood } =
        useIqOptionSubscriptions(send);
    const { getTradersMood } = useIqOptionQueries(send);
    const candle_size = useSelector((state) => state.configuration.candle_size);
    /*const pattern_length = useSelector(
        (state) => state.configuration.pattern_length
    );*/
    const amount_groups = useSelector(
        (state) => state.configuration.amount_groups
    );
    /*const auto_start_operations = useSelector(
        (state) => state.configuration.auto_start_operations
    );*/
    const last_active_value_id = useSelector(
        (state) => state.configuration.last_active_value_id
    );
    const last_active_value_id_ref = useRef(last_active_value_id);
    //const account = useSelector((state) => state.configuration.account);

    const actives = useSelector((state) => state.configuration.actives);
    const active_values = useSelector(
        (state) => state.configuration.active_values
    );
    const active_volumes = useSelector(
        (state) => state.configuration.active_volumes
    );
    // Permite ejecutar la función startActiveValues automáticamente cuando es llamada
    // por primera vez y el valor de las velas de consulta cambia
    const autoStartActiveValuesRef = useRef(false);
    const isApplyConfigRef = useRef(false);
    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);

    useEffect(() => {
        last_active_value_id_ref.current = last_active_value_id;
    }, [last_active_value_id]);

    /**
     * Cada vez que cambia active_values se analiza si ya se asignaron los
     * valores en los grupos definidos
     */
    useEffect(() => {
        if (isApplyConfigRef.current) {
            if (
                autoStartActiveValuesRef.current &&
                last_active_value_id_ref.current
            ) {
                // Si el activo actual ya tiene los grupos de datos completos
                if (
                    active_values[last_active_value_id_ref.current].length ===
                    parseInt(amount_groups)
                ) {
                    startActiveValues();
                }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(active_values)]);

    /**
     * Aplica la configuración asignada para iniciar el análisis
     */
    const applyConfiguration = () => {
        isApplyConfigRef.current = true;
        setConfigurationState(params.configurationStates.applying);
        startActiveValues();
    };

    /**
     * Genera análisis de patrones y repeticiones en cadena enviada
     *
     * @param {string} data
     * @param {object} preview_analysis
     * @returns
     */
    const getPatternAnalysis = (
        data,
        preview_analysis = {},
        start_time,
        active_id,
        data_volumes
    ) => {
        let analysis = preview_analysis;
        // Patrones analizados en la ejecución de la función
        let analyzed_patterns = {};
        //Cantidad de elementos que tiene un patrón
        let length_analysis = 2;
        let finalized = false;
        const data_volumes_array = data_volumes.split(",");

        // Ciclo para recorrer patrones de longitud length_analysis
        while (!finalized && length_analysis <= 15) {
            // cantidad de patrones de la misma longitud actual que deben existir en la cadena data
            const amount_patterns =
                data.length / params.item_pattern_length - length_analysis + 1;

            if (amount_patterns > 1) {
                // Se recorren los patrones encontrados en la cadena para asignar coincidencias
                for (let i = 0; i < amount_patterns; i++) {
                    // Patrón a analizar en el ciclo
                    const pattern = data.substr(
                        params.item_pattern_length * i,
                        params.item_pattern_length * length_analysis
                    );

                    // Si el patrón aún no ha sido analizado
                    if (!(pattern in analyzed_patterns)) {
                        analyzed_patterns[pattern] = true;

                        //Coincidencias del patrón en la cadena data
                        const coincidences = {
                            baja: 0,
                            estable: 0,
                            alza: 0,
                        };
                        const dates = [];
                        const volumes = [];

                        // Ultima aparición del patrón en la cadena
                        let last_index = 0;
                        // Detiene el ciclo cuando ya no hay apariciones del patrón actual
                        let stop = false;

                        while (!stop) {
                            const index = data.indexOf(pattern, last_index);
                            if (parseInt(index) >= 0) {
                                last_index = index + 1;
                                // El patrón tiene valores para revisar en la siguiente vela
                                if (data[index + pattern.length]) {
                                    switch (data[index + pattern.length]) {
                                        case "0":
                                            coincidences.baja++;
                                            break;
                                        case "1":
                                            coincidences.estable++;
                                            break;
                                        case "2":
                                            coincidences.alza++;
                                            break;
                                        default:
                                            break;
                                    }

                                    let date = new Date();
                                    date.setTime(start_time);
                                    date.setSeconds(
                                        date.getSeconds() +
                                            candle_size *
                                                parseInt(
                                                    index /
                                                        params.item_pattern_length
                                                )
                                    );

                                    dates.push({
                                        active_id: active_id,
                                        active_name:
                                            active_id in turbo_actives
                                                ? turbo_actives[
                                                      active_id
                                                  ].description.split(".")[1]
                                                : "No encontrado",
                                        date: date.toLocaleString(),
                                    });

                                    volumes.push(
                                        new Uint32Array(data_volumes_array)
                                            .subarray(
                                                parseInt(
                                                    index /
                                                        params.item_pattern_length
                                                ),
                                                parseInt(
                                                    index /
                                                        params.item_pattern_length
                                                ) + length_analysis
                                            )
                                            .toString()
                                    );
                                }
                            } else {
                                stop = true;
                            }
                        }
                        let total =
                            coincidences.alza +
                            coincidences.estable +
                            coincidences.baja;

                        // Si el patrón no ha sido agregado al análisis de patrones
                        if (!(pattern in analysis)) {
                            analysis[pattern] = {
                                alza: [
                                    coincidences.alza,
                                    (coincidences.alza * 100) / total,
                                ],
                                estable: [
                                    coincidences.estable,
                                    (coincidences.estable * 100) / total,
                                ],
                                baja: [
                                    coincidences.baja,
                                    (coincidences.baja * 100) / total,
                                ],
                                dates: dates,
                                volumes: volumes,
                            };
                        } else {
                            total +=
                                analysis[pattern].alza[0] +
                                analysis[pattern].estable[0] +
                                analysis[pattern].baja[0];

                            const new_alza =
                                analysis[pattern].alza[0] + coincidences.alza;
                            const new_estable =
                                analysis[pattern].estable[0] +
                                coincidences.estable;
                            const new_baja =
                                analysis[pattern].baja[0] + coincidences.baja;
                            const new_dates =
                                analysis[pattern].dates.concat(dates);
                            const new_volumes =
                                analysis[pattern].volumes.concat(volumes);

                            analysis[pattern] = {
                                alza: [new_alza, (new_alza * 100) / total],
                                estable: [
                                    new_estable,
                                    (new_estable * 100) / total,
                                ],
                                baja: [new_baja, (new_baja * 100) / total],
                                dates: new_dates,
                                volumes: new_volumes,
                            };
                        }
                    }
                }
            } else {
                // Si el patrón no puede tener repeticiones se finaliza la búsqueda
                finalized = true;
            }
            length_analysis++;
        }

        return analysis;
    };

    /**
     * Inicia la suscripción a las velas de un activo para consulta de datos y posterior
     * comparación con los patrones definidos
     */
    const startActiveValues = () => {
        autoStartActiveValuesRef.current = true;
        const keys = Object.keys(active_values);
        let active_assigned = false;
        for (let i = 0; i < keys.length; i++) {
            const active_id = keys[i];
            const data = active_values[active_id];
            if (data.length === 0) {
                active_assigned = true;
                setLastActiveValueId(active_id);
                subscribeCandles(active_id, candle_size);
                break;
            }
        }

        // Si no se asignó activo de espera de valores se generan los patrones encontrados
        // en los valores consultados y posteriormente se inicia la suscripción
        // a las velas de los activos de patrones
        if (!active_assigned) {
            let pattern_analysis = {};
            for (let i = 0; i < keys.length; i++) {
                const active_id = keys[i];
                const data = active_values[active_id];
                const data_volumes = active_volumes[active_id];
                for (let e = 0; e < data.length; e++) {
                    pattern_analysis = getPatternAnalysis(
                        data[e].values,
                        pattern_analysis,
                        data[e].from,
                        active_id,
                        data_volumes[e].volumes
                    );
                }
            }

            const pattern_analysis_keys = Object.keys(pattern_analysis);
            let max_pattern_length = 0;
            for (let a = 0; a < pattern_analysis_keys.length; a++) {
                const item = pattern_analysis[pattern_analysis_keys[a]];
                if (
                    // Sólo se admiten patrones de dos items en adelante
                    pattern_analysis_keys[a].length /
                        params.item_pattern_length <
                        2 ||
                    // No hay referencia al tamaño de la vela anterior
                    pattern_analysis_keys[a][1] === "-" ||
                    // No hay suficientes coincidencias
                    item.alza[0] + item.estable[0] + item.baja[0] <= 2 ||
                    // Porcentaje de acierto de las coincidencias
                    (item.alza[1] < 90 &&
                        item.estable[1] < 90 &&
                        item.baja[1] < 90)
                ) {
                    delete pattern_analysis[pattern_analysis_keys[a]];
                } else {
                    // Cantidad máxima de items encontrada en un patrón (el patrón está definido en el key)
                    if (
                        pattern_analysis_keys[a].length /
                            params.item_pattern_length >
                        max_pattern_length
                    ) {
                        max_pattern_length =
                            pattern_analysis_keys[a].length /
                            params.item_pattern_length;
                    }
                }
            }
            setPatternLength(max_pattern_length);
            setPatternAnalysis(pattern_analysis);

            const active_keys = Object.keys(actives);

            for (let i = 0; i < active_keys.length; i++) {
                const active_id = active_keys[i];
                subscribeCandles(active_id, candle_size);
                getTradersMood(active_id, "turbo-option");
                subscribeTradersMood("turbo-option", active_id);
            }
            autoStartActiveValuesRef.current = false;
            isApplyConfigRef.current = false;
            // Una vez se suscribe a las velas la configuración se da por aplicada
            setConfigurationState(params.configurationStates.applied);
        }
    };

    /**
     * Convierte la diferencia de un valor a otro en un string de un sólo valor
     *
     * Pensado para definir en un sólo caracter el tamaño de una vela en relación a otra
     *
     * @param {float} comparative
     * @param {float} value
     */
    const convertComparationToStringValue = (value, comparative = null) => {
        if (comparative) {
            let size = value / comparative;
            //El valor comparado es inferior al comparativo
            if (size < 1) {
                //El caracter representativo del tamaño es el primer decimal encontrado
                return size.toString().length > 1 ? size.toString()[2] : "0";
            } else {
                // Caracteres que determinan el resultado de la comparación de valores positivos
                // a -> Elementos iguales
                // b -> El elemento puede estar entre 1.1 y 2 veces el tamaño del comparativo
                // c -> El elemento puede estar entre 2.1 y 3 veces el tamaño del comparativo
                // _ -> El elemento es la cantidad de caracteres de la variable characters o más
                // veces mayor al tamaño del comparativo
                const characters =
                    "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ@";
                const position = parseInt(size) - 1;
                return characters[
                    position + 1 > characters.length
                        ? characters.length - 1
                        : position
                ];
            }
        } else {
            // EL guion determina que no hay dato para comparar
            return "-";
        }
    };

    /**
     * Convierte los datos de una vela en un string de análisis de datos
     *
     * @param {object} data
     * @param {object} candle_preview
     */
    const convertDataToStringValue = (data, candle_preview = null) => {
        let value = "";

        //Tamaño del cuerpo de la vela previa
        let candle_preview_size = null;
        if (candle_preview) {
            if (candle_preview.open > candle_preview.close) {
                candle_preview_size =
                    candle_preview.open - candle_preview.close;
            } else {
                candle_preview_size =
                    candle_preview.close - candle_preview.open;
            }
        }

        //Valores del cuerpo de la vela en la parte superior e inferior
        let top_value = 0;
        let bottom_value = 0;

        //Asignación de dirección de la vela
        // 0 Vela a la baja, 1 vela estable, 2 vela al alza
        if (data.open > data.close) {
            top_value = data.open;
            bottom_value = data.close;
            value = "0";
        } else if (data.open < data.close) {
            top_value = data.close;
            bottom_value = data.open;
            value = "2";
        } else {
            top_value = data.open;
            bottom_value = data.open;
            value = "1";
        }

        // Asignación de tamaño de la vela respecto a la anterior
        //value += "/";
        value += convertComparationToStringValue(
            top_value - bottom_value,
            candle_preview_size
        );

        value += data.max > top_value ? "+" : "-";
        // Asignación de tamaño de la mecha superior
        /*value += convertComparationToStringValue(
            //Tamaño de la cola de la vela
            data.max - top_value,
            //Si hay cola se calcula el tamaño del cuerpo de la vela, sino se envía null
            //para que se asigne un valor (-) que determinaría que no hay cola
            data.max > top_value ? top_value - bottom_value : null
        );*/

        value += data.min < bottom_value ? "+" : "-";
        // Asignación de tamaño de la vela inferior
        /*value += convertComparationToStringValue(
            //Tamaño de la cola de la vela
            bottom_value - data.min,
            //Si hay cola se calcula el tamaño del cuerpo de la vela, sino se envía null
            //para que se asigne un valor (-) que determinaría que no hay cola
            data.min < bottom_value ? top_value - bottom_value : null
        );*/

        return value + ",";
    };

    /**
     * Asigna la información de velas en el activo que espera asignación
     *
     * @param {object} candles
     */
    const addValuesToActive = (candles) => {
        if (last_active_value_id_ref.current) {
            let values = "";
            let first_id = null;
            let last_id = null;
            let from = null;
            let to = null;
            let volumes = "";
            for (let i = 0; i < candles.length; i++) {
                const el = candles[i];
                volumes += el.volume + ",";
                if (i === 0) {
                    first_id = el.id;
                    from = el.from;
                } else if (i === candles.length - 1) {
                    last_id = el.id;
                    to = el.to;
                }
                values += convertDataToStringValue(
                    el,
                    i === 0 ? null : candles[i - 1]
                );
            }

            /*console.log(from);
            console.log(to);
            let date = new Date();
            let date2 = new Date();
            date.setTime(from.toString() + "000");
            date2.setTime(to.toString() + "000");
            console.log(date.toLocaleString());
            console.log(date2.toLocaleString());*/
            addActiveVolumes(volumes);
            addActiveValues(
                first_id,
                last_id,
                values,
                from.toString() + "000",
                to.toString() + "000"
            );
        }
    };

    return {
        applyConfiguration,
        startActiveValues,
        addValuesToActive,
        convertDataToStringValue,
    };
};

export default useConfiguration;
