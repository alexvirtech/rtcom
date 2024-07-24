import { useRef, useEffect } from "preact/hooks"

export default function Video ({ stream, name }) {
    const videoRef = useRef(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return <div>
            {name && <div>{name}</div>}
            <video ref={videoRef} autoPlay playsInline muted/>
        </div>
}