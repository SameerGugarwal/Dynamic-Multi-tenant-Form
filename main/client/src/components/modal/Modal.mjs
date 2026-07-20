import Swal from 'sweetalert2';

export class Modal {
    //storing every thing we need 
    constructor(title, bodyHTML, onConfirm) {
        this.title = title;
        this.bodyHTML = bodyHTML;
        this.onConfirm = onConfirm;
        this.isDirty = false; // Track if the modal content has been modified
    }
    //Build and show the modal    
    open() {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';

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

        // 1. grab the modal body container
        const modelBody = overlay.querySelector('#modal-body');
        const confirmBtn = overlay.querySelector('#modal-confirm-btn');
        
        // Detect if this is a form modal (has inputs)
        const hasInputs = modelBody.querySelectorAll('input, select, textarea').length > 0;
        
        if (hasInputs) {
            confirmBtn.textContent = 'Close';
        }

        // 2. Listen for ANY typing or changes that bubble up 
        modelBody.addEventListener('input', () => {
            if(!this.isDirty){
                this.isDirty = true;
                if(hasInputs) confirmBtn.textContent = 'Save Changes';
            }
        });

        modelBody.addEventListener('change', () => {
            if(!this.isDirty){
                this.isDirty = true;
                if(hasInputs) confirmBtn.textContent = 'Save Changes';
            }
        });

        //Wire up all the close/confirm buttons
        overlay.querySelector('#modal-close-btn').addEventListener('click', () =>  this.handleClose());
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay ) this.handleClose();
        })
       
        
        confirmBtn.addEventListener('click', () => {
            if (hasInputs) {
                // If it's a form, only run onConfirm if changes were made
                if (this.isDirty && this.onConfirm) {
                    // If onConfirm resolves to `false`, keep the modal open (e.g. validation failed).
                    // Any other value (including undefined) closes the modal as before.
                    Promise.resolve(this.onConfirm()).then((result) => {
                        if (result !== false) this.close();
                    });
                } else {
                    // Nothing changed: just close (button reads "Close" in this state).
                    this.close();
                }
            } else {
                // For non-form modals (e.g. Delete confirmations), always run onConfirm
                if (this.onConfirm) this.onConfirm();
                this.close();
            }
        });
    }

    handleClose() {
        if (this.isDirty) {
            // terigger the asynchonous SweetAlert2
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have unsaved chages. Are you sure you want to discard them? ',
                icon: 'warning',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Save Changes',
                denyButtonText: 'Discard',
                cancelButtonText: 'Keep Editing',
                confirmButtonColor: '#2357b1', // Enovate-IT Brand 
                denyButtonColor: '#ef4444'
            }).then((result)=> {
                //User cliked save changes
                if(result.isConfirmed){
                    // Respect a `false` return (validation failed) and keep the modal open.
                    if (this.onConfirm) {
                        Promise.resolve(this.onConfirm()).then((r) => {
                            if (r !== false) this.close();
                        });
                    } else {
                        this.close();
                    }
                } else if(result.isDenied){
                    //uesr clicked discard
                    this.close();                    
                }
            });
        } else{
            this.close(); // safe to close 
        }
    }


    close(){
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.remove();
    }
}
