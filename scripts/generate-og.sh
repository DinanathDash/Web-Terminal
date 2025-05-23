#!/bin/zsh

echo "Opening the og-image generator in your default browser..."
open "scripts/generate-og-image.html"

echo "Waiting for the image to be generated..."
sleep 5

echo "Moving the generated image to the public folder..."
mv ~/Downloads/og-image.png public/

echo "Cleaning up..."
rm -f public/og-image.svg

echo "Open Graph image has been generated and moved to the public folder!"
echo "You can now commit and deploy your changes."
