import { Box, Button, TextField, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import params from "../config/params";
import useReducerActions from "../hooks/UseReducerActions";
import useIqOption from "../hooks/UseIqOption";
import useIqOptionSubscriptions from "../hooks/UseIqOptionSubscriptions";

const StartConnection = () => {
    const connection_state = useSelector(
        (state) => state.data.connection_state
    );
    const { actSetSsid } = useReducerActions();
    const { connect, disconnect, send } = useIqOption();
    const { subscribeCandles } = useIqOptionSubscriptions(send);
    const ssid = useSelector((state) => state.data.ssid);

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
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={() => {
                            const unsubscribe = subscribeCandles(1, 60);

                            setTimeout(() => {
                                unsubscribe();
                            }, 10000);
                        }}
                    >
                        Conectar al live
                    </Button>
                </Box>
            )}
        </React.Fragment>
    );
};

export default StartConnection;
