import useBotInformationActions from "./UseBotInformationActions";
import useIqOptionQueries from "../iq_option/UseIqOptionQueries";
import { useSelector } from "react-redux";

const useBotInformation = (send) => {
    const active_id = useSelector((state) => state.bot_information.active_id);
    const candle_size = useSelector(
        (state) => state.bot_information.candle_size
    );
    const first_candle_id = useSelector(
        (state) => state.bot_information.first_candle_id
    );
    const { actAddValueToPattern } = useBotInformationActions();
    const { getCandles } = useIqOptionQueries(send);

    /**
     * Convierte los datos de una vela en un string de análisis de datos
     *
     * @param {object} data
     */
    const convertDataToStringValue = (data) => {
        let value = "";

        //Valores del cuerpo de la vela en la parte superior e inferior
        let top_value = 0;
        let bottom_value = 0;

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

        // 1 si tiene cola arriba, 0 si no tiene
        value += data.max > top_value ? "1" : "0";

        // 1 si tiene cola abajo, 0 si no tiene
        value += data.min < bottom_value ? "1" : "0";
        return value + ",";
    };

    /**
     * Agrega un nuevo valor al patrón
     *
     * @param {object} data
     */
    const addValueToPattern = (data) => {
        actAddValueToPattern(convertDataToStringValue(data));
    };

    const loadCandles = (amount = 15) => {
        if (first_candle_id) {
            getCandles(
                active_id,
                candle_size,
                first_candle_id - amount,
                first_candle_id - 1
            );
        } else {
            console.log(
                "No se ha asignado el valor de identificador de la primera vela"
            );
        }
    };

    return {
        convertDataToStringValue,
        addValueToPattern,
        loadCandles,
    };
};

export default useBotInformation;
