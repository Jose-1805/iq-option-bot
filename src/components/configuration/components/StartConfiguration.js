import { Button, Stack, Switch, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import params from "../../../config/params";
import SelectActive from "../../iq_option/components/helpers/SelectActive";
import useConfigurationRedux from "../hooks/UseConfigurationRedux";
import useConfiguration from "../hooks/UseConfiguration";

const StartConfiguration = ({ send }) => {
    const {
        setCandleSize,
        setAmountGroups,
        setAutoStartOperations,
        setAccount,
        setConfigurationState,
    } = useConfigurationRedux();
    const { applyConfiguration } = useConfiguration(send);
    const candle_size = useSelector((state) => state.configuration.candle_size);
    const amount_groups = useSelector(
        (state) => state.configuration.amount_groups
    );
    const auto_start_operations = useSelector(
        (state) => state.configuration.auto_start_operations
    );
    const account = useSelector((state) => state.configuration.account);
    const configuration_state = useSelector(
        (state) => state.configuration.configuration_state
    );
    //const actives = useSelector((state) => state.configuration.actives);

    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        setDisabled(
            configuration_state !== params.configurationStates.no_applied
        );
    }, [configuration_state]);

    useEffect(() => {
        setConfigurationState(params.configurationStates.no_applied);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Aplica la configuración definida por el usuario
     */
    const validAndApplyConfiguration = () => {
        if (candle_size && amount_groups && account) {
            applyConfiguration();
        } else {
            alert("La configuración es incorrecta, revise los valores");
        }
    };

    return (
        <React.Fragment>
            <Typography variant="h5">CONFIGURACIÓN DE PARÁMETROS</Typography>
            {configuration_state === params.configurationStates.applying ? (
                <Typography>Aplicando configuración....</Typography>
            ) : (
                <React.Fragment>
                    {configuration_state ===
                    params.configurationStates.no_applied ? (
                        <React.Fragment>
                            <TextField
                                label="Tamaño de vela"
                                value={candle_size ?? ""}
                                onChange={(e) => {
                                    setCandleSize(e.target.value);
                                }}
                                disabled={disabled}
                            />
                            <TextField
                                label="Cantidad de grupos"
                                value={amount_groups ?? ""}
                                onChange={(e) => {
                                    setAmountGroups(e.target.value);
                                }}
                                disabled={disabled}
                            />
                        </React.Fragment>
                    ) : null}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Sin OA</Typography>
                        <Switch
                            disabled={disabled}
                            checked={auto_start_operations}
                            onChange={(e) => {
                                setAutoStartOperations(e.target.checked);
                            }}
                        />
                        <Typography>Con OA</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>DEMO</Typography>
                        <Switch
                            disabled={disabled}
                            checked={account === "real"}
                            onChange={(e) => {
                                setAccount(e.target.checked ? "real" : "demo");
                            }}
                        />
                        <Typography>REAL</Typography>
                    </Stack>
                    {configuration_state ===
                    params.configurationStates.no_applied ? (
                        <React.Fragment>
                            <SelectActive />
                            <SelectActive for_analysis />
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={validAndApplyConfiguration}
                                disabled={disabled}
                            >
                                Aplicar configuración
                            </Button>
                        </React.Fragment>
                    ) : null}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default StartConfiguration;
