import { useDispatch } from "react-redux";
import types from "../../redux/bot_information/types";

const useBotInformationActions = () => {
    const dispatch = useDispatch();

    /**
     * Asignación de activo del que se obtiene el patrón para analizar
     *
     * @param {integer} active_id
     */
    const actSetActiveId = (active_id) => {
        dispatch({
            type: types.SET_ACTIVE_ID,
            active_id,
        });
    };

    /**
     * Asignación de último identificador de vela
     *
     * @param {integer} last_candle_id
     */
    const actSetLastCandleId = (last_candle_id) => {
        dispatch({
            type: types.SET_LAST_CANDLE_ID,
            last_candle_id,
        });
    };

    /**
     * Asignación del patrón actual
     *
     * @param {string} value
     */
    const actAddValueToPattern = (value) => {
        dispatch({
            type: types.ADD_VALUE_TO_PATTERN,
            value,
        });
    };

    /**
     * Asignación del patrón de análisis
     *
     * @param {string} pattern
     */
    const actSetPattern = (pattern) => {
        dispatch({
            type: types.SET_PATTERN,
            pattern,
        });
    };

    /**
     * Asignación de la medida del patrón
     *
     * @param {integer} length
     */
    const actSetPatternLength = (length) => {
        dispatch({
            type: types.SET_PATTERN_LENGTH,
            length,
        });
    };

    /**
     * Agrega un nuevo valor de vela convertido a string a un activo seleccionado
     *
     * @param {integer} active_id
     * @param {string} value
     */
    const actAddCandleValue = (active_id, value) => {
        dispatch({
            type: types.ADD_CANDLE_VALUE,
            active_id,
            value,
        });
    };

    return {
        actSetActiveId,
        actSetLastCandleId,
        actSetPattern,
        actAddValueToPattern,
        actSetPatternLength,
        actAddCandleValue,
    };
};

export default useBotInformationActions;
