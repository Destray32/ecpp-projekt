import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

const PDFLayoutEwidencja = ({ data }) => {
    // sztuczne dane
    const monthYear = "Sierpień 2024";
    const employeeName = "Mateusz Pawłowski";
    const workingDays = 31;

    return (
        <Box sx={{ p: 4, bgcolor: 'background.paper' }}>
            <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
                <div className='flex flex-row justify-between'>
                    <Typography variant="h4" gutterBottom>{monthYear}</Typography>
                    <Typography variant="subtitle1">Otwarte</Typography>
                    <Typography variant="subtitle1">{employeeName}</Typography>
                    <div></div>
                </div>
            </Paper>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {[...Array(workingDays)].map((_, index) => (
                                <TableCell key={index} align="center">{index + 1}</TableCell>
                            ))}
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {['Rozpoczęcie', 'Zakończenie', 'Razem'].map((row, index) => (
                            <TableRow key={row}>
                                <TableCell component="th" scope="row">
                                    {row}
                                </TableCell>
                                {[...Array(workingDays)].map((_, dayIndex) => (
                                    <TableCell key={dayIndex} align="center">
                                        {/* dane */}
                                        {index === 3 ? '00:00' : '00:00'}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    {/* dane*/}
                                    {index === 3 ? '00:00' : '00:00'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Typography>_________________________</Typography>
                    <Typography>{employeeName}</Typography>
                    <Typography>{new Date().toLocaleString()}</Typography>
                </Box>
                <Box>
                    <Typography>_________________________</Typography>
                    <Typography>Szef</Typography>

                </Box>
            </Box>
        </Box>
    );
};

export default PDFLayoutEwidencja;