package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"github.com/gorilla/websocket"
)

var (
	targetBaseURL = "https://api.gigo.dev"
	upgrader      = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func proxyWebSocket(clientConn *websocket.Conn, r *http.Request) {
	// Create a new URL object from the target base URL and the incoming request's URL including paths and query strings
	targetURL, err := url.Parse(targetBaseURL)
	if err != nil {
	    log.Printf("Error parsing target URL: %v", err)
	    return
    }
    targetURL.Scheme = "wss"
    targetURL.Path = r.URL.Path
    targetURL.RawQuery = r.URL.RawQuery

	// Create a new HTTP header object and populate it with the incoming request's headers
	requestHeader := make(http.Header)
	requestHeader.Add("Origin", targetBaseURL + "/")
	requestHeader.Add("Host", targetURL.Host)
	requestHeader.Add("User-Agent", r.Header.Get("User-Agent"))
	// add cookies to header
	cookies := r.Cookies()
	for _, cookie := range cookies {
	    requestHeader.Add("Cookie", cookie.Name + "=" + cookie.Value)
    }

	fmt.Printf("Connecting to target: %s\n", targetURL.String())

	targetConn, _, err := websocket.DefaultDialer.Dial(targetURL.String(), requestHeader)
	if err != nil {
		log.Printf("Error dialing target: %v", err)
		return
	}
	defer targetConn.Close()

	go func() {
		for {
			msgType, msg, err := targetConn.ReadMessage()
			if err != nil {
				log.Printf("Error reading from target: %v", err)
				return
			}
			if err := clientConn.WriteMessage(msgType, msg); err != nil {
				log.Printf("Error writing to client: %v", err)
				return
			}
		}
	}()

	for {
		msgType, msg, err := clientConn.ReadMessage()
		if err != nil {
			log.Printf("Error reading from client: %v", err)
			return
		}
		if err := targetConn.WriteMessage(msgType, msg); err != nil {
			log.Printf("Error writing to target: %v", err)
			return
		}
	}
}

func main() {
	addr := ":32999"

    // Define the target URL to which we want to proxy the requests
    targetURL, err := url.Parse(targetBaseURL)
    if err != nil {
        log.Fatalf("Could not parse target URL: %v", err)
    }

	// Create a new reverse proxy instance for normal HTTP/HTTPS
	proxy := httputil.NewSingleHostReverseProxy(&url.URL{
		Scheme: "https",
		Host:   "gigo.dev",
	})

    // Customize the Director within the ReverseProxy
    proxy.Director = func(req *http.Request) {
        // Modify the request to match the target
        req.URL.Scheme = targetURL.Scheme
        req.URL.Host = targetURL.Host

        // Change the Host header, if needed
        req.Host = targetURL.Host
    }

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if websocket.IsWebSocketUpgrade(r) {
			fmt.Printf("Forwarding to websocket handler: %s %s %s\n", r.Method, r.Host, r.URL.Path)
			clientConn, err := upgrader.Upgrade(w, r, nil)
			if err != nil {
				log.Printf("WebSocket upgrade failed: %v", err)
				return
			}
			defer clientConn.Close()
			proxyWebSocket(clientConn, r)
		} else {
			fmt.Printf("Forwarding to proxy handler: %s %s %s\n", r.Method, r.Host, r.URL.Path)
			proxy.ServeHTTP(w, r)
		}
	})

	log.Printf("Server started at %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Could not start server: %v", err)
	}
}
