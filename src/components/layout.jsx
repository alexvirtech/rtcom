import TopMenu from "./topmenu"

export default function Layout({ children }) {
    return (        
            <div class="min-h-[100vh] flex flex-col max-w-[1000px] w-full mx-auto p-4">
                <div class="p-4 border border-slate-500 rounded">
                    <TopMenu />
                </div>
                <div class="grow">{children}</div>
                <div class="p-4 border border-slate-500 rounded text-center">footer</div>
            </div>
        
    )
}