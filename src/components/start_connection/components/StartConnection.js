import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import params from "../../../config/params";
import useIqOptionRedux from "../../iq_option/hooks/UseIqOptionRedux";

const StartConnection = ({ connect }) => {
    const connection_state = useSelector(
        (state) => state.iq_option.connection_state
    );
    const { setSsid } = useIqOptionRedux();
    const ssid = useSelector((state) => state.iq_option.ssid);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        setDisabled(connection_state !== params.connectionStates.disconnected);
    }, [connection_state]);

    return (
        <React.Fragment>
            <Box>
                <TextField
                    label="Ssid"
                    value={ssid ?? ""}
                    onChange={(e) => {
                        setSsid(e.target.value);
                    }}
                    disabled={disabled}
                />
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        if (ssid.length) {
                            localStorage.removeItem("queries");
                            connect();
                        }
                    }}
                    disabled={disabled}
                >
                    Conectar
                </Button>
                <Typography>
                    {params.connectionStateNames[connection_state]}
                </Typography>
            </Box>
        </React.Fragment>
    );
};

export default StartConnection;
