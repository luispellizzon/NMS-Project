import os
import logging
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List, Dict, Any, ClassVar, Optional, Type
from crewai_tools import BaseTool
from pydantic import Field, PrivateAttr, BaseModel
import json
import time

logging.basicConfig(level=logging.INFO)


class ArxivSearchTool(BaseTool):
    """
    Tool for searching arXiv for research papers.
    """
    name: str = "ArXiv Search"
    description: str = """Search arXiv for academic papers on dementia, Alzheimer's, 
    and cognitive decline. Returns paper titles, abstracts, URLs, and publication dates."""
    
    def _run(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search arXiv and return structured results.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            
        Returns:
            List of paper dictionaries
        """
        try:
            logging.info(f"Searching arXiv for: {query}")
            
            # arXiv API endpoint
            base_url = "http://export.arxiv.org/api/query"

            # Build the query - prioritize neuroscience and medical categories
            # Search in title and abstract for better relevance
            # Categories: q-bio.NC (Neurons and Cognition), cs.AI, cs.LG, stat.ML
            search_query = f"(ti:{query} OR abs:{query}) AND (cat:q-bio.NC OR cat:q-bio.QM OR cat:cs.AI OR cat:cs.LG)"

            params = {
                "search_query": search_query,
                "start": 0,
                "max_results": max_results * 3,  # Request more to filter better results
                "sortBy": "submittedDate",
                "sortOrder": "descending"
            }
            
            response = requests.get(base_url, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse the XML response
            root = ET.fromstring(response.content)
            namespace = {"atom": "http://www.w3.org/2005/Atom"}
            
            papers = []
            for entry in root.findall("atom:entry", namespace):
                try:
                    title = entry.find("atom:title", namespace).text.strip().replace("\n", " ")
                    abstract = entry.find("atom:summary", namespace).text.strip().replace("\n", " ")

                    # Filter for relevance - check if paper is actually about dementia/cognitive health
                    relevance_keywords = [
                        'dementia', 'alzheimer', 'cognitive', 'memory', 'brain',
                        'neurodegenerative', 'parkinson', 'mci', 'mild cognitive impairment',
                        'neurological', 'neurology', 'cognition', 'aging', 'elderly'
                    ]

                    text_to_check = (title + " " + abstract).lower()
                    is_relevant = any(keyword in text_to_check for keyword in relevance_keywords)

                    if is_relevant:
                        paper = {
                            "title": title,
                            "abstract": abstract,
                            "url": entry.find("atom:id", namespace).text.strip(),
                            "published": entry.find("atom:published", namespace).text.strip(),
                            "authors": [
                                author.find("atom:name", namespace).text
                                for author in entry.findall("atom:author", namespace)
                            ]
                        }
                        papers.append(paper)
                except AttributeError as e:
                    logging.warning(f"Error parsing entry: {e}")
                    continue

            # Return only the requested number of papers
            papers = papers[:max_results]
            logging.info(f"Found {len(papers)} relevant papers on arXiv")
            return papers
            
        except Exception as e:
            logging.error(f"Error searching arXiv: {e}")
            return []


class WebSearchTool(BaseTool):
    """
    Tool for searching the web for patient-friendly health information.
    Uses a simplified approach - in production, integrate with a proper search API.
    """
    name: str = "Web Search"
    description: str = """Search the web for patient-friendly information about dementia
    from trusted health sources. Returns article titles, URLs, and summaries."""

    # Curated list of trusted health sources
    TRUSTED_SOURCES: ClassVar[List[str]] = [
        "https://www.alz.org",
        "https://www.nia.nih.gov/health/alzheimers",
        "https://www.mayoclinic.org",
        "https://medlineplus.gov",
        "https://www.alzheimers.org.uk",
    ]
    
    def _run(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search for patient-friendly health information.
        
        Note: This is a simplified implementation. For production, integrate with:
        - Google Custom Search API
        - Bing Search API
        - Or build a web scraper for specific trusted sites
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            
        Returns:
            List of article dictionaries
        """
        try:
            logging.info(f"Searching web for patient info: {query}")
            
            # This is a placeholder implementation
            # In production, you would integrate with a real search API
            articles = self._get_curated_dementia_articles()
            
            # Filter by query relevance (simple keyword matching for demo)
            query_terms = query.lower().split()
            filtered = []
            for article in articles:
                relevance = sum(
                    1 for term in query_terms 
                    if term in article["title"].lower() or term in article["summary"].lower()
                )
                if relevance > 0:
                    article["relevance"] = relevance
                    filtered.append(article)
            
            # Sort by relevance and return top results
            filtered.sort(key=lambda x: x["relevance"], reverse=True)
            return filtered[:max_results]
            
        except Exception as e:
            logging.error(f"Error in web search: {e}")
            return []
    
    def _get_curated_dementia_articles(self) -> List[Dict[str, Any]]:
        """
        Returns a curated list of patient-friendly dementia articles.
        In production, this would be replaced with real-time web scraping or API calls.
        """
        return [
            {
                "title": "10 Early Signs of Alzheimer's Disease",
                "url": "https://www.alz.org/alzheimers-dementia/10_signs",
                "summary": "Learn about the 10 warning signs of Alzheimer's disease and what to watch for in yourself or a loved one.",
                "source": "Alzheimer's Association",
                "date": (datetime.now() - timedelta(days=30)).isoformat()
            },
            {
                "title": "How to Reduce Your Risk of Dementia",
                "url": "https://www.nia.nih.gov/health/prevent-dementia",
                "summary": "Evidence-based lifestyle changes that may help reduce your risk of cognitive decline.",
                "source": "National Institute on Aging",
                "date": (datetime.now() - timedelta(days=45)).isoformat()
            },
            {
                "title": "Understanding Dementia: A Guide for Caregivers",
                "url": "https://www.mayoclinic.org/diseases-conditions/dementia/in-depth/dementia/art-20048356",
                "summary": "Comprehensive guide for family members and caregivers supporting someone with dementia.",
                "source": "Mayo Clinic",
                "date": (datetime.now() - timedelta(days=60)).isoformat()
            },
            {
                "title": "New Treatments for Alzheimer's Disease",
                "url": "https://www.nia.nih.gov/health/alzheimers-treatment",
                "summary": "Overview of current treatments and promising research for Alzheimer's disease.",
                "source": "National Institute on Aging",
                "date": (datetime.now() - timedelta(days=20)).isoformat()
            },
            {
                "title": "Brain-Healthy Diet: Mediterranean and MIND Diets",
                "url": "https://www.alz.org/help-support/brain_health/brain-healthy-diet",
                "summary": "How dietary choices can support brain health and potentially reduce dementia risk.",
                "source": "Alzheimer's Association",
                "date": (datetime.now() - timedelta(days=15)).isoformat()
            },
            {
                "title": "The Importance of Exercise for Brain Health",
                "url": "https://www.nia.nih.gov/health/exercise-and-physical-activity",
                "summary": "Research shows regular physical activity is one of the best ways to maintain cognitive function.",
                "source": "National Institute on Aging",
                "date": (datetime.now() - timedelta(days=10)).isoformat()
            },
            {
                "title": "Memory Problems: When to See a Doctor",
                "url": "https://www.mayoclinic.org/diseases-conditions/alzheimers-disease/in-depth/memory-loss/art-20046326",
                "summary": "Learn when memory problems are a normal part of aging and when they might signal something more serious.",
                "source": "Mayo Clinic",
                "date": (datetime.now() - timedelta(days=35)).isoformat()
            },
            {
                "title": "Social Engagement and Cognitive Health",
                "url": "https://www.nia.nih.gov/health/social-activity-cognitive-health",
                "summary": "How staying socially active can help protect brain health as you age.",
                "source": "National Institute on Aging",
                "date": (datetime.now() - timedelta(days=25)).isoformat()
            }
        ]


class SummarizerToolInput(BaseModel):
    """Input schema for the Summarizer tool"""
    content: str = Field(..., description="Content to summarize")
    audience: str = Field(default="medical", description="Target audience: 'medical' or 'patient'")
    max_words: int = Field(default=150, description="Maximum words in summary")

class SummarizerTool(BaseTool):
    """
    Tool for creating summaries using an LLM.
    """
    name: str = "Summarizer"
    description: str = """Create clear, professional summaries of medical research or 
    health articles. Adapts tone and complexity based on target audience."""
    args_schema: Type[BaseModel] = SummarizerToolInput
    
    # Use PrivateAttr to prevent serialization issues with CrewAI
    _llm: Optional[Any] = PrivateAttr(default=None)
    
    def __init__(self, llm, **kwargs):
        super().__init__(**kwargs)
        self._llm = llm
    
    def _run(self, content: str, audience: str = "medical", max_words: int = 150) -> str:
        try:
            # Handle JSON string input if CrewAI passes it that way
            if isinstance(content, str) and content.strip().startswith('{'):
                try:
                    params = json.loads(content)
                    content = params.get('content', content)
                    audience = params.get('audience', audience)
                    max_words = params.get('max_words', max_words)
                except json.JSONDecodeError:
                    pass
            
            # Build the prompt
            if audience == "medical":
                prompt = f"""You are a medical writer creating a summary for healthcare professionals.
                
Summarize the following research content in approximately {max_words} words:

{content}

Your summary should:
1. Highlight key findings and clinical significance
2. Briefly explain methodology
3. Note any limitations
4. Use professional medical terminology
5. Be clear and concise

Summary:"""
            else:
                prompt = f"""You are a patient educator creating accessible health content.

Summarize the following health information in approximately {max_words} words:

{content}

Your summary should:
1. Explain the main message in simple, clear language
2. Highlight practical implications
3. Avoid jargon
4. Be empathetic and encouraging
5. Focus on actionable takeaways

Summary:"""
            
            # Call LLM with proper message format
            try:
                # CrewAI's LLM class uses call() method, not invoke()
                response = self._llm.call(
                    messages=[{"role": "user", "content": prompt}]
                )

                # Extract text from response - handle various formats
                if isinstance(response, dict):
                    # Try to get text from common response patterns
                    choices = response.get('choices', [])
                    if choices and isinstance(choices, list):
                        summary = choices[0].get('message', {}).get('content', str(response))
                    else:
                        summary = (response.get('text') or
                                 response.get('content') or
                                 response.get('output') or
                                 str(response))
                elif isinstance(response, str):
                    summary = response
                else:
                    summary = str(response)
                
                logging.info(f"Generated {audience} summary ({len(summary.split())} words)")
                return summary.strip()
                
            except Exception as llm_error:
                logging.error(f"LLM call failed: {llm_error}")
                
                # Fallback: implement exponential backoff for rate limits
                if "429" in str(llm_error) or "rate" in str(llm_error).lower():
                    logging.warning("Rate limit hit, waiting 60 seconds before retry...")
                    time.sleep(60)
                    return self._run(content, audience, max_words)  # Retry once
                
                return f"Summary generation failed: {str(llm_error)}"
            
        except Exception as e:
            logging.error(f"Error in SummarizerTool: {e}")
            return f"Summary unavailable due to error: {str(e)[:100]}"