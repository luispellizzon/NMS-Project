# main.py
from dotenv import load_dotenv
import os 
from crewai import Crew, Task
from agents.medical_agent import medical_agent
from agents.patient_agent import patient_agent
from agents.caregiver_agent import caregiver_agent
from crew import medical_task, patient_task, caregiver_task


env_path = os.path.join(os.path.dirname(__file__), "../config/env/.env")
load_dotenv(env_path)
if __name__ == "__main__":
    medical_crew = Crew(agents=[medical_agent], tasks=[medical_task])
    medical_results = medical_crew.kickoff()
    

    patient_crew = Crew(agents=[patient_agent], tasks=[patient_task])
    patient_results = patient_crew.kickoff()
    
    caregiver_crew = Crew(agents=[caregiver_agent], tasks=[caregiver_task])
    caregiver_results = caregiver_crew.kickoff()
    print("Medical Agent Results:", medical_results)
    print("Patient Agent Results:", patient_results)
    print("Caregiver Agent Results:", caregiver_results)
