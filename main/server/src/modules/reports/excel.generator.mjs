import ExcelJS from 'exceljs';

export const generateExcel = async (submission, user, form) => {
    const workbook = new ExcelJS.Workbook();
    
    // Add Metadata Sheet
    const metaSheet = workbook.addWorksheet('Submission Details');
    metaSheet.columns = [
        { header: 'Property', key: 'property', width: 30 },
        { header: 'Value', key: 'value', width: 50 }
    ];
    
    metaSheet.addRows([
        { property: 'Report ID', value: submission._id.toString() },
        { property: 'Form Name', value: form ? form.title : 'Unknown Form' },
        { property: 'Submitted By', value: user.name },
        { property: 'Email', value: user.email },
        { property: 'Submission Date', value: new Date(submission.createdAt).toLocaleString() },
        { property: 'Status', value: submission.status }
    ]);
    
    // Formatting Metadata Sheet
    metaSheet.getRow(1).font = { bold: true };

    // Add Answers Sheet
    const answersSheet = workbook.addWorksheet('Answers');
    answersSheet.columns = [
        { header: 'Question', key: 'question', width: 50 },
        { header: 'Answer', key: 'answer', width: 50 }
    ];

    if (submission.answers && Array.isArray(submission.answers)) {
        // Map questions by ID for easy lookup
        const questionMap = {};
        if (form && form.questions) {
            form.questions.forEach(q => {
                questionMap[q._id.toString()] = q.label;
            });
        }

        submission.answers.forEach(ans => {
            const label = questionMap[ans.questionId.toString()] || ans.questionId.toString();
            let value = ans.value;
            // Handle arrays (like checkbox answers)
            if (Array.isArray(value)) value = value.join(', ');
            
            answersSheet.addRow({
                question: label,
                answer: value
            });
        });
    }

    answersSheet.getRow(1).font = { bold: true };

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};
