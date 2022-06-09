import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import useIqOptionActions from "../hooks/iq_option/UseIqOptionActions";
import useIqOption from "../hooks/iq_option/UseIqOption";
import params from "../config/params";
import useIqOptionQueries from "../hooks/iq_option/UseIqOptionQueries";
import SelectActive from "./helpers/SelectActive";

const StartConnection = () => {
    const connection_state = useSelector(
        (state) => state.iq_option.connection_state
    );
    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);
    const { actSetSsid } = useIqOptionActions();
    const { connect, disconnect, send } = useIqOption();
    const { getInitializationData } = useIqOptionQueries(send);
    const ssid = useSelector((state) => state.iq_option.ssid);
    const current_pattern = useSelector(
        (state) => state.bot_information.current_pattern
    );
    const active_id = useSelector((state) => state.bot_information.active_id);

    return (
        <React.Fragment>
            {connection_state !== params.connectionStates.connected ? (
                <Box>
                    <TextField
                        label="Ssid"
                        value={ssid ?? ""}
                        onChange={(e) => {
                            actSetSsid(e.target.value);
                        }}
                    />
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            if (ssid.length) {
                                connect();
                            }
                        }}
                        disabled={
                            connection_state !==
                            params.connectionStates.disconnected
                        }
                    >
                        Conectar
                    </Button>
                    <Typography>
                        {params.connectionStateNames[connection_state]}
                    </Typography>
                </Box>
            ) : (
                <Box>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            disconnect();
                        }}
                    >
                        Desconectar
                    </Button>
                    {Object.keys(turbo_actives).length ? (
                        <React.Fragment>
                            <SelectActive send={send} />
                            <Typography>
                                {"Activo seleccionado: " + active_id}
                            </Typography>
                            <Typography>
                                {"Patrón actual: " + current_pattern}
                            </Typography>
                        </React.Fragment>
                    ) : (
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={getInitializationData}
                        >
                            Consultar activos de opciones
                        </Button>
                    )}
                </Box>
            )}
        </React.Fragment>
    );
};

export default StartConnection;
