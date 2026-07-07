export class Table {
    /**
     * @param {Array<string>} headers - Array of column names
     * @param {Array<Object>} rows - Array of row objects (values mapped to headers in order)
     */
    constructor(headers = [], rows = []) {
        this.headers = headers;
        this.rows = rows;
    }

    render() {
        if (!this.rows || this.rows.length === 0) {
            return `
                <div class="border border-surface-200 rounded-xl p-12 text-center bg-white shadow-sm flex flex-col items-center justify-center">
                    <p class="text-slate-800 text-sm font-semibold">Data Not Found</p>
                    <p class="text-slate-500 text-sm mt-1">No records match the current query.</p>
                </div>
            `;
        }

        const headersHtml = this.headers.map(header => `
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                ${header}
            </th>
        `).join('');
          
        const rowsHtml = this.rows.map((row, index) => {
            const isLastRow = index === this.rows.length - 1;
            const rowBorder = isLastRow ? '' : 'border-b border-slate-100';

            const cellsHtml = Object.values(row).map(cell => `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    ${cell}
                </td>
                `).join('');

            return ` 
            <tr class="${rowBorder} hover:bg-slate-50 transition-colors cursor-pointer group">
                    ${cellsHtml}
                </tr>
            `;
        }).join('');

        return `
            <div class="overflow-x-auto border border-surface-200 rounded-xl bg-white shadow-sm">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            ${headersHtml}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;    
    }
}
