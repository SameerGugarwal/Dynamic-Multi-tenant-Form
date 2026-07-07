export class Modal {
    //storing every thing we need 
    constructor(title, bodyHTML, onConfirm) {
        this.title = title;
        this.bodyHTML = bodyHTML;
        this.onConfirm = onConfirm;
    }
    //Build and show the modal    
    open() {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'fixed inset-0 z-[9998] flex items-center justify-center bg-black/50';

        // Create the white modal box inside
        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-[90%] max-w-2xl max-h-[90vh] flex flex-col';

        // ineerHTML (modal, body, footer)
        modal.innerHTML = `
            <div class="flex justify-between items-center px-6 py-4 border-b border-surface-200 shrink-0">    
                <h3 class="font-heading font-semibold text-slate-800 text-lg"></h3>                                           
                    <button id="modal-close-btn" 
                        class="text-slate-400 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
            </div>                                
                                                      
            <div class="px-6 py-6 overflow-y-auto flex-1" id="modal-body"></div>                                        
                                                      
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-surface-200 bg-surface-50 shrink-0">                 
                <button id="modal-confirm-btn"    
                    class="px-5 py-2.5 bg-brand-700 text-white font-medium text-sm rounded-lg hover:bg-brand-800 shadow-sm transition-colors">
                    Confirm
                </button>             
            </div> 
        `;

        //Safely inject title and body
        modal.querySelector('h3').textContent = this.title;
        modal.querySelector('#modal-body').innerHTML = this.bodyHTML;

        //put the modal inisde the overlay 
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        //Wire up all the close/confirm buttons
        overlay.querySelector('#modal-close-btn').addEventListener('click', () => this.close());
       
        
        overlay.querySelector('#modal-confirm-btn').addEventListener('click', () =>{
            if (this.onConfirm) this.onConfirm();
            this.close();
        });
        // Close if user clicks the dark background
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });
    }

    close(){
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.remove();
    }
}
