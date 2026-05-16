export default function Footer() {
    return(
        <footer className="bg-slate-900 dark:bg-black font-public-sans text-slate-400 w-full border-t border-slate-800 mt-auto">
            <div className="w-full py-12 px-6 flex flex-col justify-center items-center max-w-7xl mx-auto gap-2">
                <span className="text-white font-bold text-xl md:text-2xl flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    LaporWarga
                </span>
                <p className="text-center text-sm md:text-base">© {new Date().getFullYear()} Pemerintah Daerah. Terintegrasi Smart City Indonesia.</p>
            </div>
        </footer>
    );
}
