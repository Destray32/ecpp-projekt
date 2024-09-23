import React, { useRef } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography, 
    Box, 
    Button 
} from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PDFLayoutEwidencja = ({ data, month }) => {
    const componentRef = useRef();

    // Sztuczne dane
    const employeeName = "Mateusz Pawłowski";

    // wyznaczenie ilości dni w miesiącu
    const workingDays = new Date(2024, month, 0).getDate();

    // funkcja do wybrania skrótu polskiego dnia tygodnia
    const getPolishWeekdayAbbr = (date) => {
        const polishWeekdays = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
        return polishWeekdays[date.getDay()];
    };

    const handleDownloadPDF = () => {
        const input = componentRef.current;
        html2canvas(input, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');

                const marginLeft = 10; // mm
                const marginRight = 10;
                const marginTop = 10;
                const marginBottom = 10;

                // A4
                const pageWidth = 210;
                const pageHeight = 297;

                const availableWidth = pageWidth - marginLeft - marginRight;
                const availableHeight = pageHeight - marginTop - marginBottom;

                const imgWidth = availableWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = marginTop;

                pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
                heightLeft -= availableHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight + marginTop;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
                    heightLeft -= availableHeight;
                }

                pdf.save(`${employeeName}_Ewidencja_${new Date().toLocaleDateString()}.pdf`);
            })
            .catch((err) => {
                console.error('Failed to generate PDF:', err);
            });
    };


    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', fontSize: '0.75rem' }}>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownloadPDF}
                sx={{ mb: 2 }}
            >
                Download PDF
            </Button>

            <Box ref={componentRef}>
                <Paper elevation={3} sx={{ mb: 2, p: 1 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })} 2024
                        </Typography>
                        <Typography variant="body2">Otwarte</Typography>
                        <Typography variant="body2">{employeeName}</Typography>
                    </Box>
                </Paper>

                <TableContainer component={Paper}>
                    <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ padding: '4px', width: '60px' }} 
                                    align="left"
                                >
                                    {/* Header */}
                                </TableCell>
                                {[...Array(workingDays)].map((_, index) => (
                                    <TableCell 
                                        key={index} 
                                        align="center" 
                                        sx={{ padding: '4px', width: '20px'}}
                                    >
                                        <Typography variant="body2">
                                            {getPolishWeekdayAbbr(new Date(2024, month - 1, index + 1))}
                                        </Typography>
                                        {index + 1}
                                    </TableCell>
                                ))}
                                <TableCell 
                                    sx={{ padding: '4px', width: '60px' }} 
                                    align="center"
                                >
                                    Total
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {['Rozpoczęcie', 'Przerwa', 'Zakończenie', 'Razem'].map((row, rowIndex) => {
                                return (
                                    <TableRow key={row}>
                                        <TableCell 
                                            component="th" 
                                            scope="row" 
                                            sx={{ padding: '4px', fontSize: '0.75rem' }}
                                        >
                                            {row}
                                        </TableCell>
                                        {[...Array(workingDays)].map((_, dayIndex) => {
                                            const date = new Date(2024, month - 1, dayIndex + 1);
                                            const niedziela = date.getDay() === 0;
                                            const sobota = date.getDay() === 6;
                                            const backgroundCol = (niedziela || sobota) ? 'red' : 'white';
                                            return (
                                                <TableCell 
                                                    key={dayIndex} 
                                                    align="center" 
                                                    sx={{ padding: '2px', fontSize: '0.65rem', bgcolor: backgroundCol }}
                                                >
                                                    {/* do podmiany */}
                                                    {rowIndex === 2 ? '00:00' : '00:00'}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell 
                                            align="center" 
                                            sx={{ padding: '4px', fontSize: '0.75rem'}}
                                        >
                                            {/* do podmiany dane*/}
                                            {rowIndex === 2 ? '00:00' : '00:00'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box 
                    sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}
                >
                    <Box>
                        <Typography>_________________________</Typography>
                        <Typography>{employeeName}</Typography>
                        <Typography>{new Date().toLocaleDateString()}</Typography>
                    </Box>
                    <Box>
                        <Typography>_________________________</Typography>
                        <Typography>Szef</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default PDFLayoutEwidencja;
