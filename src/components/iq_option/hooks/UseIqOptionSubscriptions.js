const useIqOptionSubscriptions = (send) => {
    /**
     * Suscripción a generación de velas de un activo
     *
     * @param {integer} active_id   Identificador del activo
     * @param {integer} size        Tiempo de la vela en segundos
     * @returns function
     */
    const subscribeCandles = (
        active_id,
        size,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "candle-generated",
                params: {
                    routingFilters: {
                        active_id: active_id,
                        size: size,
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data);

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a cambios en sentimiento de trading en un tipo de instrumento de un activo
     *
     * @param {string} instrumentType   Tipo de instrumento
     * @param {integer} active_id       Identificador del activo
     * @returns function
     */
    const subscribeTradersMood = (
        instrumentType,
        active_id,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "traders-mood-changed",
                params: {
                    routingFilters: {
                        instrument: instrumentType,
                        asset_id: parseInt(active_id),
                    },
                },
            },
        };

        if (!only_return_unsubscribe) {
            send(data);
        }

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a operaciones del usuario en un instrumento y
     * tipo de cuenta determinado
     *
     * @param {string} instrument_type_1
     * @param {string} instrument_type_2
     * @param {integer} balance_id
     * @param {object} profile
     * @returns function
     */
    const subscribePortfolio = (
        instrument_type_1,
        instrument_type_2,
        balance_id,
        profile,
        only_return_unsubscribe = false
    ) => {
        const data1 = {
            name: "subscribeMessage",
            msg: {
                name: "portfolio.order-changed",
                version: "2.0",
                params: {
                    routingFilters: {
                        user_id: profile.id,
                        instrument_type: instrument_type_1, //forex, cfd, crypto, digital-option, turbo, binary
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data1);

        const data2 = {
            name: "subscribeMessage",
            msg: {
                name: "portfolio.position-changed",
                version: "3.0",
                params: {
                    routingFilters: {
                        user_id: profile.id,
                        user_balance_id: balance_id,
                        instrument_type: instrument_type_2, //forex, cfd, crypto, digital-option, turbo-option, binary-option
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data2);

        return () => {
            send(Object.assign({}, data1, { name: "unsubscribeMessage" }));
            send(Object.assign({}, data2, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a datos de operaciones en vivo
     *
     * @param {integer} active_id
     * @param {string} option_type
     * @returns function
     */
    const subscribeLiveDeal = (
        active_id,
        option_type,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "live-deal-binary-option-placed",
                version: "2.0",
                params: {
                    routingFilters: { active_id, option_type },
                },
            },
        };

        if (!only_return_unsubscribe) send(data);

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a cambios de comisión de un tipo de instrumento
     *
     * @param {string} instrument_type
     * @param {integer} user_group_id
     * @returns function
     */
    const subscribeCommissionChanged = (
        instrument_type,
        user_group_id = 193,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "commission-changed",
                version: "1.0",
                params: {
                    routingFilters: {
                        instrument_type,
                        user_group_id,
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data);

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a cambios en la lista de activos determinada
     *
     * @param {bool} is_regulated
     * @param {integer} user_group_id
     * @param {string} type             | cdf, forex, crypto
     * @returns function
     */
    const subscribeInstrumentsChanged = (
        is_regulated = false,
        user_group_id = 193,
        type,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "instruments-changed",
                version: "5.0",
                params: {
                    routingFilters: {
                        user_group_id,
                        type,
                        is_regulated,
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data);

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a cambios en la lista de activos para opciones digitales
     *
     * @param {bool} is_regulated
     * @param {integer} user_group_id
     * @returns function
     */
    const subscribeDigitalOptionsInstrumentsChanged = (
        is_regulated = false,
        user_group_id = 193,
        only_return_unsubscribe = false
    ) => {
        const data = {
            name: "subscribeMessage",
            msg: {
                name: "digital-option-instruments.underlying-list-changed",
                version: "1.0",
                params: {
                    routingFilters: {
                        user_group_id,
                        is_regulated,
                    },
                },
            },
        };

        if (!only_return_unsubscribe) send(data);

        return () => {
            send(Object.assign({}, data, { name: "unsubscribeMessage" }));
        };
    };

    /**
     * Suscripción a estado de una posición abierta para poder vender con ganancias
     *
     * @param {string} frequency
     * @param {object} ids
     * @returns function
     */
    const subscribePositionsState = (
        frequency = "frequent",
        ids,
        only_return_unsubscribe = false
    ) => {
        const data1 = {
            name: "subscribeMessage",
            msg: {
                name: "positions-state",
            },
        };

        if (!only_return_unsubscribe) send(data1);

        const data2 = {
            name: "sendMessage",
            msg: {
                name: "subscribe-positions",
                version: "1.0",
                body: {
                    frequency,
                    ids,
                },
            },
        };

        if (!only_return_unsubscribe) send(data2);

        return () => {
            send(Object.assign({}, data1, { name: "unsubscribeMessage" }));
            send(Object.assign({}, data2, { name: "unsubscribeMessage" }));
        };
    };

    return {
        subscribeCandles,
        subscribeTradersMood,
        subscribePortfolio,
        subscribeLiveDeal,
        subscribeCommissionChanged,
        subscribeInstrumentsChanged,
        subscribeDigitalOptionsInstrumentsChanged,
        subscribePositionsState,
    };
};

export default useIqOptionSubscriptions;
