# crew.py
from crewai import Crew, Task
from agents.medical_agent import medical_agent
from agents.patient_agent import patient_agent
from agents.caregiver_agent import caregiver_agent

medical_task = Task(
            description="Find top 3 dementia-related articles for doctors specialized in early dementia",
            expected_output="A JSON list of 3 medical news articles with title, URL, and short summary.",
            agent=medical_agent
        )

patient_task = Task(
            description="Find top 3 dementia-related articles for patients with early symptoms",
            expected_output="A JSON list of 3 patient with early dementia symptoms focused news articles with title, URL, and short summary.",
            agent=patient_agent
        )

caregiver_task = Task(
            description="Find top 3 early dementia-related articles for caregivers and family",
            expected_output="A JSON list of 3 caregiver focused news articles with title, URL, and short summary.",
            agent=caregiver_agent
        )


# crew = Crew(
#     agents=[medical_agent, patient_agent, caregiver_agent],
#     tasks=[medical_task, patient_task, caregiver_task]
# )
