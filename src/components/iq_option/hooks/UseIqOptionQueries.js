const useIqOptionQueries = (send) => {
    const getFirstCandles = (active_id) => {
        send({
            name: "get-first-candles",
            version: "1.0",
            body: {
                active_id: active_id,
                split_normalization: true,
            },
        });
    };

    /**
     * Solicitud para obtener los valores de velas de un activo
     *
     * @param {integer} active_id
     * @param {integer} size
     * @param {integer} from_id
     * @param {integer} to_id
     */
    const getCandles = (active_id, size, from_id, to_id) => {
        send({
            name: "sendMessage",
            //local_time: 16936,
            msg: {
                name: "get-candles",
                version: "2.0",
                body: {
                    active_id: parseInt(active_id), //79,
                    size: parseInt(size), //60,
                    from_id: parseInt(from_id), //2392495,
                    to_id: parseInt(to_id), //2392509,
                    split_normalization: true,
                    only_closed: true,
                },
            },
        });
    };

    /**
     * Consultar todas las divisas
     */
    const getCurrencyList = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-currencies-list",
                version: "5.0",
                body: {},
            },
        });
    };

    /**
     * Consultar saldo de usuario (cuenta demo y cuenta real)
     */
    const getBalances = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-balances",
                version: "1.0",
                body: {
                    types_ids: [1, 4],
                },
            },
        });
    };

    /**
     * Consulta datos de activos disponibles para opciones binarias y turbo
     */
    const getInitializationData = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-initialization-data",
                version: "3.0",
                body: {},
            },
        });
    };

    /**
     * Consulta de comisiones para activos
     *
     * @param {integer} user_group_id
     */
    const getCommissions = (user_group_id = 193) => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-commissions",
                version: "1.0",
                body: {
                    instrument_type: "binary-option",
                    user_group_id: user_group_id,
                },
            },
        });
    };

    /**
     * Consultar sentimiento de trading
     *
     * @param {integer} active_id
     * @param {string} instrument_type
     */
    const getTradersMood = (active_id, instrument_type) => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-traders-mood",
                version: "1.0",
                body: {
                    instrument: instrument_type,
                    asset_id: parseInt(active_id),
                },
            },
        });
    };

    /**
     * Consultar lista de activos para opciones digitales
     */
    const getDigitalOptionList = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "digital-option-instruments.get-underlying-list",
                version: "1.0",
                body: {
                    filter_suspended: true,
                },
            },
        });
    };

    /**
     * Consultar lista de activos para cfd
     */
    const getCdfList = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-instruments",
                version: "4.0",
                body: {
                    type: "cfd",
                },
            },
        });
    };

    /**
     * Consultar lista de activos para forex
     */
    const getForexList = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-instruments",
                version: "4.0",
                body: {
                    type: "forex",
                },
            },
        });
    };

    /**
     * Lista de activos para crypto
     */
    const getCryptoList = () => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-instruments",
                version: "4.0",
                body: {
                    type: "crypto",
                },
            },
        });
    };

    /**
     * Horarios disponibles para cierre de operaciones
     *
     * @param {string} instrument_type
     * @param {integer} period
     */
    const getActiveSchedule = (instrument_type, period) => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-active-schedule",
                version: "1.0",
                body: {
                    instrument_type: instrument_type,
                    period: period,
                },
            },
        });
    };

    /**
     * Consulta historial de operaciones entre dos fechas o por limite
     *
     * @param {integer} user_id
     * @param {integer} balance_id
     * @param {object} instrument_types
     * @param {integer} start
     * @param {integer} end
     */
    const getHistoryPositions = (
        user_id,
        balance_id,
        instrument_types = ["turbo-option", "binary-option"],
        start,
        end
    ) => {
        send({
            name: "sendMessage",
            msg: {
                name: "portfolio.get-history-positions",
                version: "2.0",
                body: {
                    user_id: user_id,
                    user_balance_id: balance_id,
                    instrument_types: instrument_types,
                    start: start,
                    end: end,
                },
            },
        });
    };

    /**
     * Consulta la información de un activo
     *
     * @param {integer} active_id
     */
    const getActive = (active_id) => {
        send({
            name: "sendMessage",
            msg: {
                name: "get-active",
                version: "5.0",
                body: {
                    id: active_id,
                },
            },
        });
    };
    return {
        getFirstCandles,
        getCandles,
        getCurrencyList,
        getBalances,
        getInitializationData,
        getCommissions,
        getTradersMood,
        getDigitalOptionList,
        getCdfList,
        getForexList,
        getCryptoList,
        getActiveSchedule,
        getHistoryPositions,
        getActive,
    };
};

export default useIqOptionQueries;
