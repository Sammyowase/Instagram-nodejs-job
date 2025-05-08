#!/bin/bash

# Print commands before executing them
set -x

# Remove .env file from Git tracking but keep it locally
git rm --cached .env 2>/dev/null || echo ".env was not tracked"

# Add .gitignore file to Git
git add .gitignore

# Commit the changes
git commit -m "Remove sensitive files and update .gitignore"

# Push the changes to the remote repository
git push

echo "Git cleanup completed!"
