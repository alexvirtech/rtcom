import { Link } from "preact-router"

export default function TopMenu() {
    return (<div class="flex justify-start gap-4">
        <Link href="/" class="hover:underline text-slate-300 cursor-pointer">Home</Link>
        <Link href="/websocket" class="hover:underline text-slate-300 cursor-pointer">Websocket</Link>
        <Link href="/peerchat" class="hover:underline text-slate-300 cursor-pointer">Peer-to-Peer</Link>        
    </div>)
}