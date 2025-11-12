# agents/patient_agent.py
from crewai import Agent
from scripts.fetch_news import FetchNewsTool

patient_news_tool = FetchNewsTool(
    name="patient_news",
    description="Fetches dementia-related news articles relevant to patients with early symptoms.",
    query="early dementia in patients OR alzheimer daily"
)

patient_agent = Agent(
    role="Patient Researcher Agent",
    goal="Find dementia-related news of interest to patients with possibility of early dementia.",
    backstory="Explains medical news in plain language.",
    llm="gemini/gemini-2.0-flash-lite",
    tools=[patient_news_tool]
)
