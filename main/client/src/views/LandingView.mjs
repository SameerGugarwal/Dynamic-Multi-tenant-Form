import { router } from '../router/router.mjs';

export default class LandingView {
    constructor(match) {
        this.match = match;
    }

    async mount(container) {
        container.innerHTML = this.render();
        this.initListeners(container);
    }

    render() {
        return `
            <div class="animate-fade-in w-full">
                <!-- Hero Section -->
                <section class="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b-2 border-surface-900 bg-surface-50">
                    <!-- Subtle Topographical Background using CSS patterns -->
                    <div class="absolute inset-0 opacity-40 pointer-events-none" style="background-image: radial-gradient(circle at center, var(--color-brand-200) 1px, transparent 1px); background-size: 24px 24px;"></div>
                    
                    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
                        <div class="inline-block border-2 border-surface-900 px-4 py-1 mb-8">
                            <span class="text-xs font-bold uppercase tracking-widest text-surface-900">ENTERPRISE ARCHITECTURE</span>
                        </div>
                        
                        <h1 class="text-[clamp(3rem,8vw,8rem)] font-heading font-black text-surface-900 uppercase tracking-tighter leading-[0.9] mb-8">
                            THE DIGITAL<br>FRONTIER
                        </h1>
                        
                        <p class="max-w-2xl text-lg md:text-xl text-brand-600 mb-12">
                            A highly-scalable, multi-tenant dynamic form engine built strictly for performance, strict data isolation, and absolute control.
                        </p>
                        
                        <button id="hero-cta-btn" class="px-10 py-5 border-2 border-surface-900 bg-surface-900 text-white font-bold uppercase tracking-widest text-sm hover:bg-transparent hover:text-surface-900 transition-colors animate-pulse-soft">
                            GET STARTED
                        </button>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="w-full bg-brand-950 text-surface-50 py-32">
                    <div class="max-w-7xl mx-auto px-6">
                        <div class="mb-20">
                            <h2 class="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter mb-4">CORE SYSTEMS</h2>
                            <div class="w-24 h-1 bg-surface-50"></div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-brand-800 text-brand-400 ">
                            <!-- Feature 1 -->
                            <div class="p-10 border-b-2 md:border-b-0 md:border-r-2 border-brand-800 hover:bg-brand-900 transition-colors">
                                <div class="w-12 h-12 border-2 border-surface-50 flex items-center justify-center mb-8">
                                    <span class="font-bold">01</span>
                                </div>
                                <h3 class="text-xl font-heading font-black uppercase tracking-widest mb-4 text-brand-600 ">Dynamic Logic Engine</h3>
                                <p class="text-brand-400 text-sm leading-relaxed">
                                    Build complex, conditional forms with zero code. Forms adapt instantly based on user input, ensuring precise data collection.
                                </p>
                            </div>

                            <!-- Feature 2 -->
                            <div class="p-10 border-b-2 md:border-b-0 md:border-r-2 border-brand-800 hover:bg-brand-900 transition-colors">
                                <div class="w-12 h-12 border-2 border-surface-50 flex items-center justify-center mb-8">
                                    <span class="font-bold">02</span>
                                </div>
                                <h3 class="text-xl font-heading font-black uppercase tracking-widest mb-4 text-brand-600 ">Strict Multi-Tenancy</h3>
                                <p class="text-brand-400 text-sm leading-relaxed">
                                    A rigid 4-tier RBAC architecture guarantees absolute data isolation between Centers, Organizations, and Users.
                                </p>
                            </div>

                            <!-- Feature 3 -->
                            <div class="p-10 hover:bg-brand-900 transition-colors">
                                <div class="w-12 h-12 border-2 border-surface-50 flex items-center justify-center mb-8">
                                    <span class="font-bold">03</span>
                                </div>
                                <h3 class="text-xl font-heading font-black uppercase tracking-widest mb-4 text-brand-600 ">Data Autonomy</h3>
                                <p class="text-brand-400 text-sm leading-relaxed">
                                    Export, analyze, and manage your isolated form submissions with enterprise-grade security and uncompromising speed.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Data / Trust Section -->
                <section class="w-full bg-surface-50 py-32 border-b-2 border-surface-900">
                    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 class="text-5xl font-heading font-black uppercase tracking-tighter text-surface-900 mb-6">BUILT FOR SCALE</h2>
                            <p class="text-brand-600 text-lg mb-8">
                                We designed TOPO to handle massive data throughput across thousands of isolated organizations simultaneously.
                            </p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-8">
                            <div>
                                <p class="text-6xl font-heading font-black tracking-tighter text-surface-900 mb-2">4</p>
                                <p class="text-xs font-bold uppercase tracking-widest text-surface-500">TIERS OF HIERARCHY</p>
                            </div>
                            <div>
                                <p class="text-6xl font-heading font-black tracking-tighter text-surface-900 mb-2">100%</p>
                                <p class="text-xs font-bold uppercase tracking-widest text-surface-500">DYNAMIC SCHEMAS</p>
                            </div>
                            <div>
                                <p class="text-6xl font-heading font-black tracking-tighter text-surface-900 mb-2">0</p>
                                <p class="text-xs font-bold uppercase tracking-widest text-surface-500">DATA LEAKAGE</p>
                            </div>
                            <div>
                                <p class="text-6xl font-heading font-black tracking-tighter text-surface-900 mb-2">&infin;</p>
                                <p class="text-xs font-bold uppercase tracking-widest text-surface-500">SCALABILITY</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    initListeners(container) {
        const ctaBtn = container.querySelector('#hero-cta-btn');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                router.navigate('/register');
            });
        }
    }
}
