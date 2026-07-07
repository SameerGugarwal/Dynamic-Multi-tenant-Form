export default class UsersView {
    async mount(container) {
        container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <h2 class="text-4xltext-brand-900 uppercase tracking-tighter mb-4">CENTER USERS</h2>
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-8 text-center">
                    <p class="text-slate-500 font-bold font-medium text-xs">USER MANAGEMENT COMING SOON</p>
                </div>
            </div>
        `;
    }
}
