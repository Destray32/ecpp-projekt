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

const PDFLayoutEwidencja = ({ data, month, year, czyOtwarte, osoba, generujacy }) => {
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
        html2canvas(input, { scale: 3 })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4'); // landscape

                // marginesy
                const marginLeft = 15; // mm
                const marginRight = 15;
                const marginTop = 15;
                const marginBottom = 15;

                // A4
                const pageWidth = 297;
                const pageHeight = 210;

                // kalulacja dostępnej szerokości i wysokości
                const availableWidth = pageWidth - marginLeft - marginRight;
                const availableHeight = pageHeight - marginTop - marginBottom;

                // kalulacja szerokości i wysokości obrazu
                const imgWidth = availableWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = marginTop;

                // kalulacja ilości stron
                const totalPages = Math.ceil(imgHeight / availableHeight);
                let currentPage = 1;

                pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
                pdf.setFontSize(10);
                pdf.text(`Page${currentPage} of${totalPages}`, pageWidth - marginRight - 30, pageHeight - marginBottom + 5);
                heightLeft -= availableHeight;

                // Add remaining pages if necessary
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight + marginTop;
                    pdf.addPage();
                    currentPage++;
                    pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
                    pdf.text(`Page${currentPage} of${totalPages}`, pageWidth - marginRight - 30, pageHeight - marginBottom + 5);
                    heightLeft -= availableHeight;
                }

                pdf.save(`${employeeName}_Ewidencja_${new Date().toLocaleDateString()}.pdf`);
            })
            .catch((err) => {
                console.error('Failed to generate PDF:', err);
            });
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'background.paper', fontSize: '0.85rem' }}>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownloadPDF}
                sx={{ mb: 3 }}
            >
                Download PDF
            </Button>

            <Box ref={componentRef}>
                <Paper elevation={4} sx={{ mb: 3, p: 2 }}>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })} 2024
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body1">Otwarte</Typography>
                            <Typography variant="body1">{employeeName}</Typography>
                        </Box>
                    </Box>
                </Paper>

                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ padding: '8px', width: '80px', fontSize: '0.9rem', backgroundColor: '#f0f0f0' }} 
                                    align="left"
                                >
                                    Operacja
                                </TableCell>
                                {[...Array(workingDays)].map((_, index) => (
                                    <TableCell 
                                        key={index} 
                                        align="center" 
                                        sx={{ padding: '8px', width: '30px', fontSize: '0.9rem', backgroundColor: '#f0f0f0' }}
                                    >
                                        <Typography variant="body2">
                                            {getPolishWeekdayAbbr(new Date(2024, month - 1, index + 1))}
                                        </Typography>
                                        {index + 1}
                                    </TableCell>
                                ))}
                                <TableCell 
                                    sx={{ padding: '8px', width: '80px', fontSize: '0.9rem', backgroundColor: '#f0f0f0' }} 
                                    align="center"
                                >
                                    Total
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {['Rozpoczęcie', 'Przerwa', 'Zakończenie', 'Razem'].map((row, rowIndex) => (
                                <TableRow key={row}>
                                    <TableCell 
                                        component="th" 
                                        scope="row" 
                                        sx={{ padding: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}
                                    >
                                        {row}
                                    </TableCell>
                                    {[...Array(workingDays)].map((_, dayIndex) => {
                                        const date = new Date(2024, month - 1, dayIndex + 1);
                                        const lastRow = rowIndex === 3;
                                        const isSunday = date.getDay() === 0;
                                        const isSaturday = date.getDay() === 6;
                                        const backgroundCol = (isSunday || isSaturday) ? '#ffe6e6' : '#ffffff';
                                        const fontWei = lastRow ? 'bold' : 'normal';
                                        return (
                                            <TableCell 
                                                key={dayIndex} 
                                                align="center" 
                                                sx={{ padding: '6px', fontSize: '0.85rem', bgcolor: backgroundCol, fontWeight: fontWei }}
                                            >
                                                {/* do wypełnienia*/}
                                                {rowIndex === 2 ? '17:00' : (rowIndex === 0 ? '08:00' : (rowIndex === 1 ? '12:00' : '20:00'))}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell 
                                        align="center" 
                                        sx={{ padding: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}
                                    >
                                        {/* do wypełnienia*/}
                                        {rowIndex === 3 ? '40:00' : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box 
                    sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}
                >
                    <Box>
                        <Typography>_________________________</Typography>
                        <Typography>{employeeName}</Typography>
                        <Typography>
                            {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                        </Typography>
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
