import { useEffect, useState } from 'preact/hooks'
import Peer from 'peerjs'
import Message from './message'
import Video from './video'
import { peerConfig } from '../utils/config'

export default function PeerVideo() {
    const [peer, setPeer] = useState(null)
    const [connection, setConnection] = useState(null)
    const [call, setCall] = useState(null)
    const [address, setAddress] = useState('')
    const [recipient, setRecipient] = useState('')
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState('')
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)

    useEffect(() => {
        // init peer on component mount
        const pr = new Peer(peerConfig)
        setPeer(pr)
        // my video stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setLocalStream(stream)
        })
        return () => {
            pr.destroy()
        }
    }, [])

    useEffect(() => {
        if (!peer) return
        // get my address (peer id)
        peer.on('open', id => {
            console.log('Peer ID', id)
            setAddress(id)
        })
        // for text messages - from recipient
        peer.on('connection', con => {
            console.log('Connection received')
            con.on('open', () => {
                console.log('Connected')
                setRecipient(con.peer)
                setConnection(con)
            })
        })
        // for video calls - from recipient
        peer.on('call', incomingCall => {
            setCall(incomingCall)
            incomingCall.answer(localStream)
            incomingCall.on('stream', remoteStream => {
                setRemoteStream(remoteStream)
            })
            incomingCall.peerConnection.ontrack = event => {
                console.log('Track event received on incoming call')
                const [stream] = event.streams
                setRemoteStream(stream)
            }
        })
    }, [peer])

    useEffect(() => {
        if (!connection) return
        connection.on('open', () => {
            console.log('Connected')
            setRecipient(connection.peer)
            setConnection(connection)
            // initiate video call
            const cn = peer.call(connection.peer, localStream)
            setCall(cn)
            cn.peerConnection.ontrack = event => {
                console.log('Track event received on outgoing call')
                const [stream] = event.streams
                setRemoteStream(stream)
            }

            const existingTracks = cn.peerConnection.getSenders().map(sender => sender.track?.kind)
            console.log('Existing tracks before adding: ', existingTracks)

            localStream.getTracks().forEach(track => {
                if (!existingTracks.includes(track.kind)) {
                    console.log(`Adding track: ${track.kind}`)
                    try {
                        cn.peerConnection.addTrack(track, localStream)
                    } catch (error) {
                        console.error(`Failed to add track: ${track.kind}`, error)
                    }
                } else {
                    console.log(`Track already exists: ${track.kind}`)
                }
            })

            const updatedTracks = cn.peerConnection.getSenders().map(sender => sender.track?.kind)
            console.log('Existing tracks after adding: ', updatedTracks)
        })
        connection.on('data', function (data) {
            handleData(data)
        })
        connection.on('close', () => {
            disconnect()
        })
        connection.on('error', err => {
            console.error('Connection error:', err)
        })
    }, [connection])

    useEffect(() => {
        if (!call) return
        call.on('stream', remoteStream => {
            setRemoteStream(remoteStream)
        })
        call.on('close', () => {
            disconnect()
        })
        call.on('error', err => {
            console.error('Call error:', err)
        })
        call.peerConnection.ontrack = event => {
            console.log('Track event received on call')
            const [stream] = event.streams
            setRemoteStream(stream)
        }

        // Ensure tracks are added to the call
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                const sender = call.peerConnection.getSenders().find((s) => s.track?.kind === track.kind)
                if (!sender) {
                    console.log(`Adding missing track: ${track.kind}`)
                    call.peerConnection.addTrack(track, localStream)
                } else {
                    console.log(`Track already added: ${track.kind}`)
                }
            })
        }
    }, [call,localStream])

    const connectRecipient = e => {
        e.preventDefault()
        if (connection) {
            disconnect()
        } else {
            connect(recipient)
        }
    }

    const connect = recId => {
        // open connection to recipient
        const con = peer.connect(recId)
        setConnection(con)
        console.log('Connection established - sender')
    }

    const disconnect = () => {
        if (call) call.close()
        if (connection) {
            connection.close()
            setConnection(null) // sender side
        }
        setRecipient('')
        setMessages([])
        setMessage('')
        setRemoteStream(null)
    }

    const handleData = d => {
        console.log(d)
        setMessages(prevMessages => [...prevMessages, { me: false, text: d }])
    }

    const handleSend = e => {
        e.preventDefault()
        if (connection) {
            setMessages(prevMessages => [...prevMessages, { me: true, text: message }])
            connection.send(message)
            setMessage('')
        }
    }

    return (
        <div>
            <div class="py-4 text-2xl">Peer-to-peer Video Chat</div>
            {peer && (
                <>
                    <div class="flex justify-start w-full gap-2 pb-4">
                        <div class="w-1/2">
                            <div class="text-slate-400">my address</div>
                            <div class="selectable">{address}</div>
                        </div>
                        <div class="w-1/2">
                            <div class="text-slate-400">recipient</div>
                            <form onSubmit={connectRecipient}>
                                <div class="flex justify-start gap-2">
                                    <input type="text" required readOnly={connection} class="bg-slate-500 w-full" value={recipient} onInput={e => setRecipient(e.target.value)} />
                                    <button type="submit" class="border border-slate-500 hover:border-slate-300 py-1 px-2">
                                        {connection ? 'disconnect' : 'connect'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-8 py-4 h-auto">
                        <div class="p-0">
                            <Video stream={localStream} />
                        </div>
                        <div class="p-0">{remoteStream ? <Video stream={remoteStream} /> : <div>recipient is not connected</div>}</div>
                    </div>
                    {connection && (
                        <form onSubmit={handleSend}>
                            <div class="flex justify-start gap-2">
                                <input type="text" value={message} onInput={e => setMessage(e.target.value)} class="grow bg-slate-500" />
                                <button type="submit" class="py-1 px-2 border border-slate-500 hover:border-slate-300">
                                    Send
                                </button>
                            </div>
                            {/* vertical scroll must be added */}
                            {messages.reverse().map((message, index) => (
                                <Message key={index} text={message.text} me={message.me} />
                            ))}
                        </form>
                    )}
                </>
            )}
        </div>
    )
}
