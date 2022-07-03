import { useDispatch } from "react-redux";
import types from "../redux/types";

const useConfigurationRedux = () => {
    const dispatch = useDispatch();

    /**
     * Agrega un activo a la configuración de activos para patrones
     *
     * @param {integer} active_id
     */
    const addActive = (active_id) => {
        dispatch({
            type: types.ADD_ACTIVE,
            active_id,
        });
    };

    /**
     * Asigna los activos a la configuración de activos para patrones
     *
     * @param {Object} actives
     */
    const setActives = (actives) => {
        dispatch({
            type: types.SET_ACTIVES,
            actives,
        });
    };

    /**
     * Elimina un activo de la configuración de activos para patrones
     *
     * @param {integer} active_id
     */
    const removeActive = (active_id) => {
        dispatch({
            type: types.REMOVE_ACTIVE,
            active_id,
        });
    };

    /**
     * Agrega un activo a la configuración de activos de consulta de datos
     *
     * @param {integer} active_id
     */
    const addActiveValue = (active_id) => {
        dispatch({
            type: types.ADD_ACTIVE_VALUE,
            active_id,
        });
    };

    /**
     * Asigna los activos a la configuración de activos de consulta de datos
     *
     * @param {object} actives
     */
    const setActiveValues = (actives) => {
        dispatch({
            type: types.SET_ACTIVE_VALUES,
            actives,
        });
    };

    /**
     * Elimina un activo de la configuración de activos para consulta de datos
     *
     * @param {integer} active_id
     */
    const removeActiveValue = (active_id) => {
        dispatch({
            type: types.REMOVE_ACTIVE_VALUE,
            active_id,
        });
    };

    /**
     * Asignación de id del siguiente activo en espera para asignar patrón
     *
     * @param {integer} active_id
     */
    const setLastActiveId = (active_id) => {
        dispatch({
            type: types.SET_LAST_ACTIVE_ID,
            active_id,
        });
    };

    /**
     * Asignación de id del siguiente activo en espera para asignar valores
     *
     * @param {integer} active_id
     */
    const setLastActiveValueId = (active_id) => {
        dispatch({
            type: types.SET_LAST_ACTIVE_VALUE_ID,
            active_id,
        });
    };

    /**
     * Asignación de la medida del patrón
     *
     * @param {integer} length
     */
    const setPatternLength = (length) => {
        dispatch({
            type: types.SET_PATTERN_LENGTH,
            length,
        });
    };

    /**
     * Asignación de la medida de las velas a analizar
     *
     * @param {integer} size
     */
    const setCandleSize = (size) => {
        dispatch({
            type: types.SET_CANDLE_SIZE,
            size,
        });
    };

    /**
     * Asignación de cantidad de grupos de datos por activo de consulta
     *
     * @param {integer} amount
     */
    const setAmountGroups = (amount) => {
        dispatch({
            type: types.SET_AMOUNT_GROUPS,
            amount,
        });
    };

    /**
     * Asignación de parámetro de definición de ejecución de operaciones automáticas
     *
     * @param {Boolean} value
     */
    const setAutoStartOperations = (value) => {
        dispatch({
            type: types.SET_AUTO_START_OPERATIONS,
            value,
        });
    };

    /**
     * Asignación de cuenta para operaciones automáticas (demo|real)
     *
     * @param {string} account
     */
    const setAccount = (account) => {
        dispatch({
            type: types.SET_ACCOUNT,
            account,
        });
    };

    /**
     * Asignación del estado actual de la configuración
     *
     * @param {integer} state
     */
    const setConfigurationState = (state) => {
        dispatch({
            type: types.SET_CONFIGURATION_STATE,
            state,
        });
    };

    /**
     * Adición de valores de un activo para comparación con los patrones actuales
     *
     * @param {integer} first_candle_id
     * @param {integer} last_candle_id
     * @param {string} values
     */
    const addActiveValues = (
        first_candle_id,
        last_candle_id,
        values,
        from,
        to
    ) => {
        dispatch({
            type: types.ADD_ACTIVE_VALUES,
            first_candle_id,
            last_candle_id,
            values,
            from,
            to,
        });
    };

    /**
     * Adición de valores de un activo para comparación con los patrones actuales
     *
     * @param {string} volumes
     */
    const addActiveVolumes = (volumes) => {
        dispatch({
            type: types.ADD_ACTIVE_VOLUMES,
            volumes,
        });
    };

    /**
     * Asignación de patrón actual para un activo
     *
     * @param {integer} active_id
     * @param {string} pattern
     */
    const setPattern = (active_id, pattern) => {
        dispatch({
            type: types.SET_PATTERN,
            active_id,
            pattern,
        });
    };

    /**
     * Asignación de patrón actual para un activo
     *
     * @param {integer} active_id
     * @param {string} pattern
     */
    const setPatternAnalysis = (pattern_analysis) => {
        dispatch({
            type: types.SET_PATTERN_ANALYSIS,
            pattern_analysis,
        });
    };

    /**
     * Adición de un valor al patrón de un activo
     *
     * @param {integer} active_id
     * @param {string} value
     */
    const addValueToPattern = (active_id, value) => {
        dispatch({
            type: types.ADD_VALUE_TO_PATTERN,
            active_id,
            value,
        });
    };

    /**
     * Adición de un valor los datos de un activo
     *
     * @param {integer} active_id
     * @param {string} value
     */
    const addActiveValueData = (active_id, value) => {
        dispatch({
            type: types.ADD_ACTIVE_VALUE_DATA,
            active_id,
            value,
        });
    };

    /**
     *
     * @param {integer} active_id
     * @param {float} value
     */
    const setTradersMood = (active_id, value) => {
        dispatch({
            type: types.SET_TRADERS_MOOD,
            active_id,
            value,
        });
    };

    return {
        addActive,
        setActives,
        removeActive,
        addActiveValue,
        setActiveValues,
        removeActiveValue,
        setLastActiveId,
        setLastActiveValueId,
        setPatternLength,
        setCandleSize,
        setAmountGroups,
        setAutoStartOperations,
        setAccount,
        setConfigurationState,
        addActiveValues,
        addActiveVolumes,
        setPattern,
        setPatternAnalysis,
        addValueToPattern,
        addActiveValueData,
        setTradersMood,
    };
};

export default useConfigurationRedux;
