#!/bin/bash
# Script para iniciar el servidor local - Versión Robusta

# Get IP address
IP=$(ipconfig getifaddr en0)
if [ -z "$IP" ]; then
    IP="127.0.0.1"
fi

echo "==================================================="
echo "  SERVIDOR DE PUNTOS APP"
echo "==================================================="
echo "ABRE ESTO EN TU IPHONE/IPAD:"
echo "http://$IP:8000"
echo "==================================================="

# 1. Try PHP (Often installed and works without prompts)
if command -v php &>/dev/null; then
    echo "Iniciando con PHP..."
    php -S 0.0.0.0:8000
    exit 0
fi

# 2. Try Ruby (Standard on Mac)
if command -v ruby &>/dev/null; then
    echo "Iniciando con Ruby..."
    ruby -run -e httpd . -p 8000
    exit 0
fi

# 3. Try Python 3 (Last resort if others fail)
# We check version to see if it triggers the prompt without hanging
if python3 --version &>/dev/null; then
    echo "Iniciando con Python 3..."
    python3 -m http.server 8000 --bind 0.0.0.0
    exit 0
fi

echo "❌ No he podido iniciar ningún servidor (ni PHP, ni Ruby, ni Python)."
