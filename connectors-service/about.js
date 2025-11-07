import React from "react"

const abouts = {
  "client": {
    "host": "10.101.53.35"
  },
  "server": {
    "current_time": 1731012000,
    "services": [
      {
        "name": "weather",
        "widgets": [
          {
            "name": "city_temperature",
            "description": "Display the current temperature and weather conditions for a given city.",
            "params": [
              {
                "name": "city",
                "type": "string"
              }
            ]
          },
          {
            "name": "weekly_forecast",
            "description": "Display the 7-day weather forecast for a given city.",
            "params": [
              {
                "name": "city",
                "type": "string"
              }
            ]
          }
        ]
      },
      {
        "name": "sports_news",
        "widgets": [
          {
            "name": "football_news",
            "description": "Display the latest football or sports news headlines.",
            "params": []
          }
        ]
      },
      {
        "name": "crypto",
        "widgets": [
          {
            "name": "bitcoin_price",
            "description": "Display the current Bitcoin price and its 24h variation.",
            "params": []
          },
          {
            "name": "top_cryptos",
            "description": "Display the top 5 cryptocurrencies by market capitalization.",
            "params": []
          }
        ]
      },
      {
        "name": "rss",
        "widgets": [
          {
            "name": "article_list",
            "description": "Display a list of the most recent articles from an RSS feed.",
            "params": [
              {
                "name": "link",
                "type": "string"
              },
              {
                "name": "number",
                "type": "integer"
              }
            ]
          }
        ]
      }
    ]
  }
}
