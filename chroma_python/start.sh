#!/bin/sh

# Run the population script
python chroma_populate.py

# Run the Flask endpoint
python chroma_endpoint.py