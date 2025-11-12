# agents/medical_agent.py
from crewai import Agent
from scripts.fetch_news import FetchNewsTool

medical_news_tool = FetchNewsTool(
    name="medical_news",
    description="Fetches dementia research and clinical trial updates",
    query="early dementia clinical trials OR alzheimer biomarkers"
)

medical_agent = Agent(
    role="Medical Researcher Agent",
    goal="Find dementia-related medical news of interest to doctors.",
    backstory="Expert curator for clinical trials, biomarkers, and guidelines.",
    llm="gemini/gemini-2.0-flash-lite",
    tools=[medical_news_tool]
)
