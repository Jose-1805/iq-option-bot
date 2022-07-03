import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useConfigurationRedux from "../../../configuration/hooks/UseConfigurationRedux";

const SelectActive = ({ for_analysis }) => {
    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);
    const actives = useSelector((state) => state.configuration.actives);
    const active_values = useSelector(
        (state) => state.configuration.active_values
    );
    const [values, setValues] = useState([]);
    const { setActives, setActiveValues } = useConfigurationRedux();

    /**
     * Cada cambio de los activos seleccionados se asigna
     * a la variable values si el select es para ese fin
     */
    useEffect(() => {
        if (!for_analysis) {
            const new_values = [];
            const keys = Object.keys(actives);
            for (let i = 0; i < keys.length; i++) {
                new_values.push(keys[i]);
            }
            setValues(new_values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actives]);

    /**
     * Cada cambio de los activos para consulta de datos se asigna
     * a la variable values si el select es para ese fin
     */
    useEffect(() => {
        if (for_analysis) {
            const new_values = [];
            const keys = Object.keys(active_values);
            for (let i = 0; i < keys.length; i++) {
                new_values.push(keys[i]);
            }
            setValues(new_values);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_values]);

    const handleChange = (e) => {
        if (e.target.value) {
            if (for_analysis) {
                setActiveValues(e.target.value);
            } else {
                setActives(e.target.value);
            }
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
                <MenuItem value={keys[i]} key={keys[i]}>
                    {turbo_actives[keys[i]].description.split(".")[1]}
                </MenuItem>
            );
        }
        return items;
    };

    return (
        <FormControl fullWidth>
            <InputLabel
                id={"selector-activo" + (for_analysis ? "-analysis" : "")}
            >
                {for_analysis ? "Activos para analizar" : "Activos para operar"}
            </InputLabel>
            <Select
                labelId={"selector-activo" + (for_analysis ? "-analysis" : "")}
                id={"active_id" + (for_analysis ? "-analysis" : "")}
                value={values}
                multiple
                onChange={handleChange}
            >
                {getItems()}
            </Select>
        </FormControl>
    );
};

export default SelectActive;
