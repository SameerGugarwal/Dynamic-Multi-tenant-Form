import Swal from 'sweetalert2';

export class Toast {
    static init() {
        return Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: '!bg-white !rounded-xl !border !border-surface-200 !shadow-lg',
                title: '!text-slate-800 !font-sans !text-sm !font-semibold',
            },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    }

    static success(message) {
        this.init().fire({
            icon: 'success',
            title: message,
            iconColor: '#09090b' 
        });
    }

    static error(message) {
        this.init().fire({
            icon: 'error',
            title: message,
            iconColor: '#09090b' 
        });
    }

    static info(message) {
        this.init().fire({
            icon: 'info',
            title: message,
            iconColor: '#09090b' 
        });
    }
}
