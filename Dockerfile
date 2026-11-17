FROM node:22-bookworm-slim AS base

# Install curl, ca-certificates, fontconfig, and TeX Live fallback + Static Tectonic binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    tar \
    fontconfig \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# Install static musl Tectonic 0.15.0 binary
RUN curl -L -s https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pre-warm Tectonic package cache at image build time
RUN printf '\\documentclass[11pt,a4paper]{article}\n\\usepackage[margin=0.75in]{geometry}\n\\usepackage[T1]{fontenc}\n\\usepackage{tgtermes}\n\\usepackage{libertinus}\n\\usepackage{ebgaramond}\n\\usepackage{microtype}\n\\usepackage[hidelinks]{hyperref}\n\\usepackage{enumitem}\n\\usepackage{titlesec}\n\\usepackage[usenames,dvipsnames]{xcolor}\n\\begin{document}\nWarmup\n\\end{document}\n' > /tmp/warmup.tex \
    && tectonic /tmp/warmup.tex --outdir /tmp \
    && rm -f /tmp/warmup.*

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
