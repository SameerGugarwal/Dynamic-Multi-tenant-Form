import Report from '../../database/models/Report.model.mjs';

export const createReport = async (reportData) => {
    const report = new Report(reportData);
    return await report.save();
};

export const getReportsByUser = async (userId) => {
    return await Report.find({ generatedBy: userId }).sort({ createdAt: -1 });
};
