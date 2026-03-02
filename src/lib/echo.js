import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

if (typeof window !== "undefined") {
    window.Pusher = Pusher;
}

const echo = typeof window !== "undefined" && process.env.NEXT_PUBLIC_REVERB_APP_KEY
    ? new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: "http://localhost:8000/broadcasting/auth",
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    const token = localStorage.getItem("token");
                    axios.post("http://localhost:8000/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                        .then(response => {
                            callback(false, response.data);
                        })
                        .catch(error => {
                            callback(true, error);
                        });
                }
            };
        },
    })
    : null;

export default echo;