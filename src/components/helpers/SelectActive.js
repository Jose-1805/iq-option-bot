import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import useBotInformationActions from "../../hooks/bot_information/UseBotInformationActions";
import useIqOptionSubscriptions from "../../hooks/iq_option/UseIqOptionSubscriptions";

const SelectActive = ({ send }) => {
    const active_id = useSelector((state) => state.bot_information.active_id);
    const candle_size = useSelector(
        (state) => state.bot_information.candle_size
    );
    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);
    const { actSetActiveId } = useBotInformationActions();
    const { subscribeCandles } = useIqOptionSubscriptions(send);

    const handleChange = (e) => {
        if (e.target.value) {
            active_id && subscribeCandles(active_id, candle_size, true)();
            actSetActiveId(e.target.value.toString());
            subscribeCandles(e.target.value, candle_size);
        } else {
            alert(
                "Valor no válido, restablecer conexión y seleccionar de nuevo"
            );
        }
    };

    /**
     * Genera los items seleccionables de cada activo
     * @returns object
     */
    const getItems = () => {
        let items = [];

        const keys = Object.keys(turbo_actives);
        for (let i = 0; i < keys.length; i++) {
            items.push(
                <MenuItem value={keys[i].toString()}>
                    {turbo_actives[keys[i]].description.split(".")[1]}
                </MenuItem>
            );
        }
        return items;
    };
    return (
        <FormControl fullWidth>
            <InputLabel id="selector-activo">Activo</InputLabel>
            <Select
                labelId="selector-activo"
                id="active_id"
                value={active_id}
                label="Activo"
                onChange={handleChange}
            >
                {getItems()}
            </Select>
        </FormControl>
    );
};

export default SelectActive;
