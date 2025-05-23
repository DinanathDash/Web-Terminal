#!/bin/zsh

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!"
