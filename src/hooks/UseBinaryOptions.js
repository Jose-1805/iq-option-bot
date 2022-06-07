import { useState, useRef } from "react";
import useIqOptionSubscriptions from "./UseIqOptionSubscriptions";

const useBinaryOptions = (send) => {
    const [currentTurboActives, setCurrentTurboActives] = useState({});
    const [traderMoodActivesTurbo, setTraderMoodActivesTurbo] = useState({});
    const traderMoodActivesTurboRef = useRef({});

    const [currentBinaryActives, setCurrentBinaryActives] = useState({});
    const [traderMoodActivesBinary, setTraderMoodActivesBinary] = useState({});
    const traderMoodActivesBinaryRef = useRef({});

    const { subscribeTradermood } = useIqOptionSubscriptions(send);

    /**
     * Restablece valores a datos iniciales
     */
    const restartData = () => {
        setCurrentTurboActives({});
        setTraderMoodActivesTurbo({});
        traderMoodActivesTurboRef.current = {};
        setCurrentBinaryActives({});
        setTraderMoodActivesBinary({});
        traderMoodActivesBinaryRef.current = {};
    };

    /**
     * Asigna la información de los activos en las variables de estado
     *
     * @param {object} data
     * @param {string} instrumentType
     */
    const setActives = (data, instrumentType = "binary-option") => {
        const keys = Object.keys(data);

        if (keys.length) {
            let newActives = {};

            for (let i = 0; i < keys.length; i++) {
                const active = data[keys[i]];
                if (active.enabled) {
                    newActives[active.id] = active;
                }
            }

            if (instrumentType === "binary-option")
                setCurrentBinaryActives(newActives);
            else if (instrumentType === "turbo-option")
                setCurrentTurboActives(newActives);
        }
    };

    /**
     * Solicita la información de trader mood para los activos actuales
     * y solicita la suscripción a las actualizaciones de trader mood
     *
     * @param {string} instrumentType
     */
    const startTraderMoodAllActives = (instrumentType = "binary-option") => {
        const actives =
            instrumentType === "binary-option"
                ? currentBinaryActives
                : instrumentType === "turbo-option"
                ? currentTurboActives
                : {};

        const keys = Object.keys(actives);

        if (keys.length) {
            let newTraderMoodActives = {};

            // Recorrido de todos los activos encontrados
            for (let i = 0; i < keys.length; i++) {
                const active = actives[keys[i]];

                let name = active.description.split(".");
                name = name.length === 2 ? name[1].split("/") : null;

                newTraderMoodActives[active.id] = {
                    name: name,
                    description: active.description,
                    id: active.id,
                    tradermood: 0,
                };

                subscribeTradermood(instrumentType, active.id);
            }

            // Se almacena la información en las variables de estado
            if (instrumentType === "turbo-option") {
                traderMoodActivesTurboRef.current = newTraderMoodActives;
                setTraderMoodActivesTurbo(traderMoodActivesTurboRef.current);
            } else if (instrumentType === "binary-option") {
                traderMoodActivesBinaryRef.current = newTraderMoodActives;
                setTraderMoodActivesBinary(traderMoodActivesBinaryRef.current);
            }
        }
    };

    /**
     * Asignación de datos de trader mood en variables de estado
     *
     * @param {object} data
     */
    const setTradeMood = (data) => {
        if (data.instrument === "binary-option") {
            const new_data = Object.assign(
                {},
                traderMoodActivesBinaryRef.current[data.asset_id],
                { trademood: parseFloat(data.value).toFixed(2) }
            );
            traderMoodActivesBinaryRef.current = Object.assign(
                {},
                traderMoodActivesBinaryRef.current,
                { [data.asset_id]: new_data }
            );
            setTraderMoodActivesBinary(traderMoodActivesBinaryRef.current);
        } else if (data.instrument === "turbo-option") {
            const new_data = Object.assign(
                {},
                traderMoodActivesTurboRef.current[data.asset_id],
                { trademood: parseFloat(data.value).toFixed(2) }
            );
            traderMoodActivesTurboRef.current = Object.assign(
                {},
                traderMoodActivesTurboRef.current,
                { [data.asset_id]: new_data }
            );
            setTraderMoodActivesTurbo(traderMoodActivesTurboRef.current);
        }
    };

    /*useEffect(() => {
		if(Object.keys(currentBinaryActives).length){
			subscribeCandles();
		}
	}, [currentBinaryActives])*/

    /*useEffect(() => {
		if(Object.keys(currentTurboActives).length){
			startTraderMood("turbo-option");
		}
	}, [currentTurboActives])

	useEffect(() => {
		if(Object.keys(currentBinaryActives).length){
			startTraderMood("binary-option");
		}
	}, [currentBinaryActives])*/

    return {
        setActives,

        startTraderMoodAllActives,
        setTradeMood,
        traderMoodTurbo: traderMoodActivesTurbo,
        traderMoodBinary: traderMoodActivesBinary,

        currentTurboActives,
        currentBinaryActives,
        restartData,
    };
};

export default useBinaryOptions;
