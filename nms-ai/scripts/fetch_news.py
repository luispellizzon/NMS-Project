# scripts/fetch_news.py
import feedparser
from typing import List, Dict
from crewai.tools import BaseTool
import urllib.parse

class FetchNewsTool(BaseTool):
    name: str
    description: str
    query: str 

    def _run(self, query: str = "", max_results: int = 3) -> List[Dict]:
        search_query = urllib.parse.quote_plus(self.query)
        url = f"https://news.google.com/rss/search?q={search_query}&hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(url)
        return [
            {
                "title": e.title,
                "url": e.link,
                "published": getattr(e, "published", ""),
                "summary": getattr(e, "summary", "")
            }
            for e in feed.entries[:max_results]
        ]

    async def _arun(self, query: str = "", max_results: int = 3):
        return self._run(query, max_results)
