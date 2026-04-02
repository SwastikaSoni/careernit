import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, Tabs, Tab, TextField, MenuItem, Button,
    Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress, Grid
} from '@mui/material';
import { Download as DownloadIcon, Assessment as ReportIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllDrives, getDriveApplicants, getAllApplications } from '../../services/driveService';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const ReportsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [tabIndex, setTabIndex] = useState(0);

    // Drive Report State
    const [drives, setDrives] = useState<any[]>([]);
    const [selectedDrive, setSelectedDrive] = useState<string>('');
    const [driveApplicants, setDriveApplicants] = useState<any[]>([]);
    const [loadingDrive, setLoadingDrive] = useState(false);

    // Student Report State
    const [searchQuery, setSearchQuery] = useState('');
    const [studentHistory, setStudentHistory] = useState<any[]>([]);
    const [loadingStudent, setLoadingStudent] = useState(false);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await getAllDrives();
            setDrives(res.drives || []);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleDriveChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const driveId = e.target.value;
        setSelectedDrive(driveId);
        if (!driveId) {
            setDriveApplicants([]);
            return;
        }

        setLoadingDrive(true);
        try {
            const res = await getDriveApplicants(driveId);
            setDriveApplicants(res.applicants || []);
        } catch (err: any) {
            enqueueSnackbar('Failed to fetch applicants', { variant: 'error' });
        } finally {
            setLoadingDrive(false);
        }
    };

    const handleStudentSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoadingStudent(true);
        try {
            // By passing search query, backend filters by name/rollNumber
            const res = await getAllApplications({ search: searchQuery });
            setStudentHistory(res.applications || []);
            if (res.applications?.length === 0) {
                enqueueSnackbar('No applications found for this student', { variant: 'info' });
            }
        } catch (err: any) {
            enqueueSnackbar('Failed to fetch student applications', { variant: 'error' });
        } finally {
            setLoadingStudent(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'selected': return 'success';
            case 'shortlisted': return 'warning';
            case 'rejected': return 'error';
            default: return 'primary';
        }
    };

    // --- PDF Export Logic ---

    const exportDriveReport = () => {
        if (!driveApplicants.length) return;
        const doc = new jsPDF();
        const driveObj = drives.find(d => d._id === selectedDrive);
        const driveName = driveObj?.company?.name || driveObj?.title || 'Drive';

        doc.setFontSize(18);
        doc.text(`Placement Report: ${driveName}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, HH:mm')}`, 14, 30);
        doc.text(`Total Applicants: ${driveApplicants.length}`, 14, 36);

        const tableData = driveApplicants.map((app) => [
            app.student?.name || 'N/A',
            app.student?.rollNumber || 'N/A',
            app.student?.department?.code || 'N/A',
            app.student?.cgpa || 'N/A',
            app.status.charAt(0).toUpperCase() + app.status.slice(1),
            dayjs(app.appliedAt).format('DD MMM YYYY')
        ]);

        autoTable(doc, {
            startY: 42,
            head: [['Student Name', 'Roll Number', 'Dept', 'CGPA', 'Status', 'Applied At']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [92, 107, 192] }
        });

        doc.save(`${driveName}_Report.pdf`);
    };

    const exportStudentReport = () => {
        if (!studentHistory.length) return;
        const doc = new jsPDF();
        const studentInfo = studentHistory[0]?.student;
        const studentName = studentInfo?.name || 'Student';
        const rollNo = studentInfo?.rollNumber || searchQuery;

        doc.setFontSize(18);
        doc.text(`Application History: ${studentName}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Roll Number: ${rollNo}`, 14, 30);
        doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, HH:mm')}`, 14, 36);

        const tableData = studentHistory.map((app) => [
            app.drive?.company?.name || app.drive?.title || 'N/A',
            app.drive?.jobType || 'N/A',
            app.status.charAt(0).toUpperCase() + app.status.slice(1),
            dayjs(app.appliedAt).format('DD MMM YYYY')
        ]);

        autoTable(doc, {
            startY: 42,
            head: [['Company / Drive', 'Job Type', 'Status', 'Applied At']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [38, 166, 154] } // Different color for student report
        });

        doc.save(`${studentName}_History.pdf`);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                <ReportIcon sx={{ fontSize: 32, color: '#5C6BC0' }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
                    Reports & Exports
                </Typography>
            </Box>

            <Card sx={{ borderRadius: '18px', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2, bgcolor: '#f8f9fa' }}>
                    <Tabs value={tabIndex} onChange={(_, nv) => setTabIndex(nv)} indicatorColor="primary">
                        <Tab label="Per-Drive Reports" sx={{ fontWeight: 600 }} />
                        <Tab label="Student History" sx={{ fontWeight: 600 }} />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* PER-DRIVE REPORTS TAB */}
                    <TabPanel value={tabIndex} index={0}>
                        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 8 }}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Placement Drive"
                                    value={selectedDrive}
                                    onChange={handleDriveChange}
                                >
                                    <MenuItem value="">-- Select Drive --</MenuItem>
                                    {drives.map(d => (
                                        <MenuItem key={d._id} value={d._id}>
                                            {d.company?.name || d.title} ({d.packageLPA} LPA)
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    disabled={driveApplicants.length === 0}
                                    onClick={exportDriveReport}
                                    sx={{ background: 'linear-gradient(135deg, #5C6BC0, #7E57C2)', px: 3, py: 1.2, borderRadius: '10px' }}
                                >
                                    Export PDF
                                </Button>
                            </Grid>
                        </Grid>

                        {loadingDrive ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : driveApplicants.length > 0 ? (
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Roll Number</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Dept</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {driveApplicants.map((app) => (
                                            <TableRow key={app._id} hover>
                                                <TableCell>{app.student?.name}</TableCell>
                                                <TableCell>{app.student?.rollNumber}</TableCell>
                                                <TableCell>{app.student?.department?.code}</TableCell>
                                                <TableCell>
                                                    <Chip label={app.status.toUpperCase()} size="small" color={getStatusColor(app.status)} variant="outlined" />
                                                </TableCell>
                                                <TableCell>{dayjs(app.appliedAt).format('DD MMM YYYY')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        ) : selectedDrive ? (
                            <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>No applicants for this drive yet.</Typography>
                        ) : null}
                    </TabPanel>

                    {/* STUDENT HISTORY TAB */}
                    <TabPanel value={tabIndex} index={1}>
                        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Search by Name or Roll Number"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && handleStudentSearch()}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Button variant="outlined" fullWidth onClick={handleStudentSearch} sx={{ py: 1.2, borderRadius: '10px' }}>
                                    Search
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    disabled={studentHistory.length === 0}
                                    onClick={exportStudentReport}
                                    sx={{ background: 'linear-gradient(135deg, #26A69A, #00897B)', px: 3, py: 1.2, borderRadius: '10px' }}
                                >
                                    Export PDF
                                </Button>
                            </Grid>
                        </Grid>

                        {loadingStudent ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress sx={{ color: '#26A69A' }} />
                            </Box>
                        ) : studentHistory.length > 0 ? (
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#e0f2f1' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Company / Drive</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Job Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Applied On</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentHistory.map((app) => (
                                            <TableRow key={app._id} hover>
                                                <TableCell sx={{ fontWeight: 500, color: '#1A1A2E' }}>
                                                    {app.drive?.company?.name || app.drive?.title}
                                                </TableCell>
                                                <TableCell>{app.drive?.jobType}</TableCell>
                                                <TableCell>
                                                    <Chip label={app.status.toUpperCase()} size="small" color={getStatusColor(app.status)} variant="outlined" />
                                                </TableCell>
                                                <TableCell>{dayjs(app.appliedAt).format('DD MMM YYYY')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        ) : null}
                    </TabPanel>

                </Box>
            </Card>
        </Box>
    );
};

export default ReportsPage;
