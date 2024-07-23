import Home from './components/home'
import Layout from './components/layout'
import PeerChat from './components/peerchat'
import Websocket from './components/websocket'
import { Router } from 'preact-router'

export function App() {
    return (
        <Layout>
            <Router>
                <Home path="/" />
                <Websocket path="/websocket" />
                <PeerChat path="/peerchat" />
            </Router>
        </Layout>
    )
}
