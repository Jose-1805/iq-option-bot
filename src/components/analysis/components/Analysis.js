import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const Analysis = () => {
    const actives = useSelector((state) => state.configuration.actives);
    const pattern_analysis = useSelector(
        (state) => state.configuration.pattern_analysis
    );
    const active_values = useSelector(
        (state) => state.configuration.active_values
    );
    const turbo_actives = useSelector((state) => state.iq_option.turbo_actives);

    /**
     * Información de cada activo seleccionado para operar
     * @returns
     */
    const getItems = () => {
        let items = [];
        const keys = Object.keys(actives);
        for (let i = 0; i < keys.length; i++) {
            const el = actives[keys[i]];
            items.push(
                <Grid item xs={12} lg={6} xl={4} key={i}>
                    <Typography variant="h5">
                        {turbo_actives[keys[i]].description.split(".")[1]}
                    </Typography>
                    <Typography>
                        <strong>Patrón actual: </strong>
                        {el.pattern}
                    </Typography>

                    <Box my={2}>
                        {el.current_operation &&
                        el.current_operation.direction ? (
                            <Typography>
                                <strong>
                                    Dirección siguiente vela{" "}
                                    {el.current_operation.direction} :
                                </strong>{" "}
                                {parseInt(el.current_operation.direction) === 0
                                    ? "BAJA"
                                    : parseInt(
                                          el.current_operation.direction
                                      ) === 1
                                    ? "ESTABLE"
                                    : "ALZA"}{" "}
                                <strong>Cantidad: </strong>
                                {el.current_operation.amount}{" "}
                                <strong>Porcentaje: </strong>
                                {el.current_operation.percentage}{" "}
                                <strong>Alza: </strong>
                                {el.current_operation.alza}{" "}
                                <strong>Estable: </strong>
                                {el.current_operation.estable}{" "}
                                <strong>Baja: </strong>
                                {el.current_operation.baja}
                                <strong>Patrón aplicado: </strong>
                                {el.current_operation.pattern}
                            </Typography>
                        ) : (
                            <Typography>Sin operación definida</Typography>
                        )}
                    </Box>
                </Grid>
            );
        }
        return items;
    };

    const getData = () => {
        let items = [];
        const keys = Object.keys(active_values);
        for (let i = 0; i < keys.length; i++) {
            const el = active_values[keys[i]];
            for (let e = 0; e < el.length; e++) {
                items.push(
                    <Accordion key={i + "_" + e}>
                        <AccordionSummary
                            aria-controls={"panel1a-content" + i + "-" + e}
                            id={"panel1a-header" + i + "-" + e}
                        >
                            <Typography>Activo {keys[i]}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography
                                sx={{ overflowWrap: "break-word", mt: 2 }}
                            >
                                {el[e].values}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                );
            }
        }
        return items;
    };

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                {getItems()}
            </Grid>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        console.log(pattern_analysis);
                    }}
                >
                    Console log PATTERN ANALYSIS
                </Button>
            </Box>
            <Box>{getData()}</Box>
        </React.Fragment>
    );
};

export default Analysis;
