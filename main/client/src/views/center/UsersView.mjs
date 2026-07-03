export default class UsersView {
    async mount(container) {
        container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter mb-4">CENTER USERS</h2>
                <div class="border-2 border-surface-900 bg-white p-8 text-center">
                    <p class="text-surface-500 font-bold uppercase tracking-widest text-xs">USER MANAGEMENT COMING SOON</p>
                </div>
            </div>
        `;
    }
}
