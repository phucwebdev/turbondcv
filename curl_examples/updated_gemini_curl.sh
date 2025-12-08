#!/usr/bin/env bash

# Updated Gemini curl example using the provided API key
# WARNING: Do not commit this file with a real key in public repos.

API_KEY="AIzaSyCGjOk-FRDty0EqANIprwtxz1Qq7ercV9I"

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
  -H "X-goog-api-key: ${API_KEY}" \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'
