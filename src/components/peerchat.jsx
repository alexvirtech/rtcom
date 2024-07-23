import { useEffect, useState } from 'preact/hooks'
import Peer from 'peerjs'

export default function PeerChat() {
    const [peer, setPeer] = useState(null)
    const [address, setAddress] = useState('')

    useEffect(() => {
        const pr = new Peer()
        /* pr.on('open', id => {
            console.log('Peer ID', id)
        }) */
        setPeer(pr)
        return () => {
            pr.destroy()
        }
    }, [])

    useEffect(() => {
        if (!peer) return
        peer.on('open', id => {
            console.log('Peer ID', id)
            setAddress(id)
        })
    }, [peer])

    return (
        <div>
            <div class="py-4 text-2xl">Peer-to-peer Chat</div>
            {peer && (
                <div class="flex justify-start w-full gap-2">
                    <div class="w-1/2">
                        <div class="text-slate-400">my address</div>
                        <div class="selectable">{address}</div>
                    </div>
                    <div class="w-1/2">
                        <div class="text-slate-400">recipient</div>
                        <div class="flex justify-start gap-1">
                            <input type="text" class="bg-slate-500 w-full" />
                            <button class="border  border-slate-500 hover:border-slate-300 px-2">connect</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
