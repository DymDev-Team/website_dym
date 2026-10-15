// Logo DYM de la barre latérale : logotype blanc quand elle est dépliée,
// carré orange « D » quand elle est repliée en icônes.
export default function AppLogo() {
    return (
        <>
            <div className="hidden aspect-square size-8 items-center justify-center bg-dym font-display text-lg leading-none text-white group-data-[collapsible=icon]:flex">
                D
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 group-data-[collapsible=icon]:hidden">
                <img
                    src="/images/logo-dym-blanc.png"
                    alt="DYM Manufacture"
                    width={162}
                    height={90}
                    className="h-9 w-auto"
                />
                <span className="hx-mono border-l border-white/15 pl-3 text-[9px] leading-tight tracking-[0.12em] text-white/55 uppercase">
                    Espace
                    <br />
                    admin
                </span>
            </div>
        </>
    );
}
