export const PDFService = {
    /**
     * Triggers a native print dialogue optimized for PDF printing
     * @param {string} title 
     * @param {HTMLElement} elementToPrint 
     */
    exportToPDF(title, elementToPrint) {
        if (!elementToPrint) {
            console.warn('No element provided for PDF export.');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        // Inject styles directly for the print window to match our brutalist theme
        const styles = `
            <style>
                body { font-family: 'Inter', sans-serif; padding: 20px; color: #111; }
                h1 { font-family: 'Outfit', sans-serif; text-transform: uppercase; border-bottom: 2px solid #111; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #111; padding: 12px; text-align: left; }
                th { background-color: #f5f5f5; text-transform: uppercase; font-size: 12px; }
            </style>
        `;

        printWindow.document.write('<html><head><title>' + title + '</title>');
        printWindow.document.write(styles);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${title}</h1>`);
        printWindow.document.write(elementToPrint.innerHTML);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.focus();
        
        // Trigger print dialog (users can Save as PDF)
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
