import PDFDocument from 'pdfkit';

export const generatePDF = (submission, user, form) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            doc.fontSize(20).text('Submission Report', { align: 'center' });
            doc.moveDown();

            // --- Metadata Section ---
            doc.fontSize(14).text('Metadata', { underline: true });
            doc.fontSize(12).moveDown(0.5);
            doc.text(`Report ID: ${submission._id.toString()}`);
            doc.text(`Form Name: ${form ? form.title : 'Unknown Form'}`);
            doc.text(`Submitted By: ${user.name} (${user.email})`);
            doc.text(`Submission Date: ${new Date(submission.createdAt).toLocaleString()}`);
            doc.text(`Status: ${submission.status}`);
            doc.moveDown(2);

            // --- Answers Section ---
            doc.fontSize(14).text('Answers', { underline: true });
            doc.fontSize(12).moveDown(0.5);

            if (submission.answers && Array.isArray(submission.answers)) {
                const questionMap = {};
                if (form && form.sections) {
                    form.sections.forEach(sec => {
                        if (sec.questions && Array.isArray(sec.questions)) {
                            sec.questions.forEach(q => {
                                if (q.id) questionMap[q.id.toString()] = q.text || q.label || 'Untitled Question';
                            });
                        }
                    });
                }

                submission.answers.forEach((ans, index) => {
                    const label = questionMap[ans.questionId.toString()] || ans.questionId.toString();
                    let value = ans.value;
                    if (Array.isArray(value)) value = value.join(', ');

                    doc.font('Helvetica-Bold').text(`${index + 1}. ${label}`);
                    doc.font('Helvetica').text(`${value || 'N/A'}`, { indent: 20 });
                    doc.moveDown(0.5);
                });
            } else {
                doc.text('No answers found.');
            }

            // Finalize PDF file
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
