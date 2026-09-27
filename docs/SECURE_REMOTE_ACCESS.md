# Secure Remote Access Setup: Connecting InfinityFree Web Host to POCO Android Phone Server

Because your phone uses mobile data or home WiFi behind **Carrier-Grade NAT (CGNAT)** without a static public IP, standard router port-forwarding does not work.

We use a **Secure Outbound Tunnel** to expose your phone's local `http://localhost:5000` port as a public HTTPS endpoint.

---

## Option 1: Cloudflare Tunnel (Recommended - 100% Free & Fast)

Cloudflare Tunnel (`cloudflared`) connects your phone directly to Cloudflare's global edge network via encrypted QUIC tunnel.

### Setup Steps in Termux:

1. Download the ARM64 `cloudflared` binary inside Termux:

```bash
cd ~
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
mv cloudflared $PREFIX/bin/
```

2. Start the HTTPS Quick Tunnel pointing to your Express backend:

```bash
cloudflared tunnel --url http://localhost:5000
```

3. Output will print a free HTTPS endpoint:
```text
+-----------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                 |
|  https://salihport-demo.trycloudflare.com                                         |
+-----------------------------------------------------------------------------------+
```

4. **Copy this URL** (`https://salihport-demo.trycloudflare.com`). This is your backend API base URL for InfinityFree!

---

## Option 2: Pinggy Tunnel (Alternative - Zero Installation)

Pinggy requires no binary download. It uses built-in SSH inside Termux:

```bash
ssh -R 80:localhost:5000 free@pinggy.io
```

Pinggy will output a public HTTPS URL like `https://xxx.pinggy.link`.

---

## Option 3: LocalTunnel (Alternative - Node.js based)

```bash
npm install -g localtunnel
lt --port 5000
```

Yields a public URL: `https://xxx.loca.lt`.

---

## Security Best Practices for Phone Server

1. **Restricted CORS**: In `backend/.env`, set `ALLOWED_ORIGIN=https://your-domain.infinityfreeapp.com`.
2. **Never expose SQLite files directly**: Access to database records is permitted ONLY through authenticated REST API endpoints requiring JWT tokens.
3. **No SSH shell exposure**: Do NOT open port 22 or Termux shell to the public tunnel URL. Only proxy port 5000 (`http://localhost:5000`).
