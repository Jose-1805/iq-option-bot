import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import StartConnection from "./start_connection/components/StartConnection";
import useIqOption from "./iq_option/hooks/UseIqOption";
import params from "../config/params";
import StartConfiguration from "./configuration/components/StartConfiguration";
import Analysis from "./analysis/components/Analysis";

const Start = () => {
    const connection_state = useSelector(
        (state) => state.iq_option.connection_state
    );
    const configuration_state = useSelector(
        (state) => state.configuration.configuration_state
    );
    const { connect, disconnect, send } = useIqOption();

    const [date, setDate] = useState("");

    useEffect(() => {
        const id = setInterval(() => {
            setDate(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(id);
        };
    }, []);

    const ButtonDisconnect = () => {
        return (
            <Button
                color="primary"
                variant="contained"
                onClick={disconnect}
                disabled={
                    connection_state !== params.connectionStates.connected
                }
            >
                Desconectar
            </Button>
        );
    };

    return (
        <React.Fragment>
            <Box mb={2}>
                <Typography>{date}</Typography>
            </Box>
            {connection_state !== params.connectionStates.connected ? (
                <StartConnection connect={connect} />
            ) : configuration_state !== params.configurationStates.applied ? (
                <React.Fragment>
                    <ButtonDisconnect />
                    <StartConfiguration send={send} />
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <ButtonDisconnect />
                    <StartConfiguration send={send} />
                    <Analysis />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default Start;
