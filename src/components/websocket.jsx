import { useState,useEffect } from "preact/hooks"
import Message from "./message"

export default function Websocket() {
    const [ws, setWs] = useState(null)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080")
        ws.onopen = () => {
            console.log("Connected")
        }
        ws.onmessage = (event) => {
            console.log("Message received", event.data)
            setMessages((prevMessages) => [...prevMessages, { me: false, text: event.data }])
        }
        ws.onclose = () => {
            console.log("Disconnected")
        }
        setWs(ws)
        return () => {
            ws.close()
        }
    }, [])

    const handleSend = (e) => {
        e.preventDefault()
        ws.send(message)
        setMessages((prevMessages) => [...prevMessages, { me: true, text: message }])
        setMessage("")
    }

    return (
        <div>
            <div class="py-4 text-2xl">Websocket Chat</div>
            <form onSubmit={handleSend}>
                <div class="flex justify-start gap-2">
                    <input type="text" value={message} onInput={e => setMessage(e.target.value)} class="grow bg-slate-500"/>
                    <button type="submit" class="py-1 px-2 border border-slate-500 hover:border-slate-300">Send</button>
                </div>
                {
                    messages.map((message, index) => <Message key={index} text={message.text} me={message.me} />)
                }
            </form>
        </div>
    )
}