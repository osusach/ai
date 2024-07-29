# RAG con langchain

## Requerimientos

- Ollama
- pnpm

## Instalación y ejecución
Pullear modelos y crear servidor
```bash
ollama serve
ollama pull llama3
ollama pull mxbai-embed-large
```
En otra terminal
```bash
pnpm install
pnpm run dev
```
Si tienes problemas en Linux para ejecutar `ollama serve` debido a que el puerto está siendo usado, puedes ejecutar `systemctl stop ollama` y luego ejecutar
el comando de nuevo.