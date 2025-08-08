echo "Setting up Vue 3 development environment..."

echo "Fixing permissions..."
sudo chown -R node:node /workspace/node_modules
sudo chown -R 1000:1000 ~/.claude

echo "Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

echo "Setup complete!"