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
                <div class="border-2 border-surface-900 p-12 text-center bg-white flex flex-col items-center justify-center">
                    <p class="text-surface-900 text-sm font-black uppercase tracking-widest">DATA NOT FOUND</p>
                    <p class="text-surface-500 text-xs font-bold uppercase tracking-widest mt-2">No records match the current query.</p>
                </div>
            `;
        }

        const headersHtml = this.headers.map(header => `
            <th class="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-surface-900 border-b-2 border-r-2 last:border-r-0 border-surface-900 bg-surface-50">
                ${header}
            </th>
        `).join('');

        const rowsHtml = this.rows.map((row, index) => {
            const isLastRow = index === this.rows.length - 1;
            const rowBorder = isLastRow ? '' : 'border-b-2 border-surface-900';
            
            const cellsHtml = Object.values(row).map(cell => `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-surface-900 border-r-2 last:border-r-0 border-surface-900">
                    ${cell}
                </td>
            `).join('');

            return `
                <tr class="${rowBorder} hover:bg-brand-100 transition-colors cursor-pointer group">
                    ${cellsHtml}
                </tr>
            `;
        }).join('');

        return `
            <div class="overflow-x-auto border-2 border-surface-900 bg-white">
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
