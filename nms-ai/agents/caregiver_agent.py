# agents/patient_agent.py
from crewai import Agent
from scripts.fetch_news import FetchNewsTool

caregiver_news_tool = FetchNewsTool(
    name="caregiver_news",
    description="Fetches early dementia caregiving for caregivers and caregiver-friendly news",
    query="early dementia caregiving OR alzheimer daily life support"
)

caregiver_agent = Agent(
    role="Caregiver Researcher Agent",
    goal="Find early dementia-related news of interest to caregivers and family with dementia relatives.",
    backstory="Explains medical news in easy and friendly language.",
    llm="gemini/gemini-2.0-flash-lite",
    tools=[caregiver_news_tool]
)
