import TopMenu from "./topmenu"

export default function Layout({ children }) {
    return (
        <header className="h-screen bg-gradient-to-b from-gray-900 to-slate-800 text-white p-4">
            <div class="h-full flex flex-col max-w-[1000px] w-full mx-auto">
                <div class="p-4 border border-slate-500 rounded">
                    <TopMenu />
                </div>
                <div class="grow">{children}</div>
                <div class="p-4 border border-slate-500 rounded text-center">footer</div>
            </div>
        </header>
    )
}