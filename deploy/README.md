# Deploying Upscalify (free, on Oracle Always Free)

This runs the **whole app** — UI, API, and a real Real-ESRGAN image model — on a
single Oracle Always Free ARM VM, behind automatic HTTPS.

- **Images:** real Real-ESRGAN weights, on CPU (same model, no GPU needed).
- **Video:** the temporally-stable ffmpeg upscale (real SeedVR2 needs a GPU,
  which the free tier doesn't have — add it later behind `INFERENCE_URL`).

Because it's one long-lived process, the in-memory job registry and temp-dir
storage work unchanged. No cloud rewrite.

```
caddy (HTTPS)  ->  web (Next.js)  ->  inference (Real-ESRGAN CPU)
```

---

## 1. Create the VM (Oracle Cloud console)

1. Sign up at <https://www.oracle.com/cloud/free/> (a card is required to verify
   identity — Always Free usage is **not** charged).
2. **Compute → Instances → Create instance.**
   - **Image:** Canonical Ubuntu 22.04 (or 24.04).
   - **Shape:** *Ampere* → `VM.Standard.A1.Flex` → **2 OCPU, 12 GB RAM**.
   - **SSH keys:** upload your public key (or let it generate one and download
     the private key).
   - Create.
3. Copy the instance's **public IP**.

## 2. Open the firewall

Two layers must both allow 80/443.

**a) Oracle security list** (console): *Networking → Virtual Cloud Networks →
your VCN → Security Lists → Default → Add Ingress Rules:*

| Source CIDR | Protocol | Dest. port |
|-------------|----------|------------|
| `0.0.0.0/0` | TCP      | `80`       |
| `0.0.0.0/0` | TCP      | `443`      |

**b) The VM's own iptables** (Oracle Ubuntu ships with a restrictive default).
SSH in (`ssh ubuntu@<PUBLIC_IP>`) and run:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 3. Install Docker

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker    # or log out/in so `docker` works without sudo
```

## 4. Point the domain at the VM

At your DNS provider for `theatom.lk`, add an **A record**:

```
upscalify   A   <PUBLIC_IP>
```

Wait until `dig +short upscalify.theatom.lk` returns the IP before step 6 —
Caddy needs it resolving to issue the certificate.

## 5. Get the code onto the VM

```bash
git clone https://github.com/<your-account>/<your-repo>.git upscalify
cd upscalify/deploy
```

(If the repo is private, use a deploy key or a personal access token.)

## 6. Build and run

```bash
docker compose up -d --build
```

First build takes a while (PyTorch + model weights download inside the image).
Check it's healthy:

```bash
docker compose ps
docker compose logs -f caddy      # watch the TLS certificate get issued
```

Then open **https://upscalify.theatom.lk** and upload an image.

---

## Everyday operations

```bash
docker compose logs -f web         # app logs
docker compose logs -f inference   # model server logs (per-image timings)
docker compose restart web         # restart just the app
git pull && docker compose up -d --build   # deploy an update
docker compose down                # stop everything
```

## Notes & limits

- **Speed:** CPU Real-ESRGAN is slower than a GPU — a photo may take tens of
  seconds. That's the free-tier tradeoff; quality is identical to the GPU model.
- **Guard rails** (in `inference/app.py`): sources over ~16 MP are rejected;
  over ~4 MP the 4× request is served at 2× to protect memory and output size.
- **To change the domain:** edit `deploy/Caddyfile` and
  `docker compose up -d`.
- **Adding a real GPU video engine later:** stand up a SeedVR2 server and point
  the app's `INFERENCE_URL` / `getBackend()` at it — nothing above that seam
  changes.
