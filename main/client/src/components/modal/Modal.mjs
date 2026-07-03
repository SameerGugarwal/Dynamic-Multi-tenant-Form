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
        modal.className = 'bg-white border-2 border-surface-900 shadow-[4px_4px_0px_#09090b] w-[90%] max-w-2xl max-h-[90vh] flex flex-col';

        // ineerHTML (modal, body, footer)
        modal.innerHTML = `
            <div class="flex justify-between items-center px-6 py-4 border-b-2 border-surface-900 shrink-0">    
                <h3 class="font-heading font-black uppercase tracking-tight text-surface-900 text-lg"></h3>                                           
                    <button id="modal-close-btn" 
                        class="text-surface-900 font-black text-xl leading-none hover:opacity-60 transition-opacity">
                        ✕
                    </button>
            </div>                                
                                                      
            <div class="px-6 py-6 overflow-y-auto flex-1" id="modal-body"></div>                                        
                                                      
            <div class="flex justify-end gap-3 px-6 py-4 border-t-2 border-surface-900 shrink-0">                 
                <button id="modal-confirm-btn"    
                    class="px-5 py-2 bg-surface-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-surface-800 transition-colors">
                    CONFIRM
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
