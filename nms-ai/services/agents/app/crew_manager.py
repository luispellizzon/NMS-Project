import os
import logging
import yaml
from typing import List, Dict, Any
from pathlib import Path
from crewai import Agent, Task, Crew, Process
from .tools import ArxivSearchTool, WebSearchTool, SummarizerTool
from crewai import LLM

logging.basicConfig(level=logging.INFO)


class NewsCrewManager:
    """
    Manages CrewAI agents for news generation and risk assessment.
    Loads agent and task configurations from YAML files.
    """
    
    def __init__(self):
        # Initialize Gemini LLM
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.llm = LLM(
            model="gemini/gemini-2.5-flash",
            api_key=gemini_api_key,
            temperature=0.7,
            timeout=60.0,
            max_retries=3,  # Increased retries
            # Add exponential backoff
            retry_config={"max_wait": 30, "exponential_base": 2}
        )
        
        # Initialize tools
        self.arxiv_tool = ArxivSearchTool()
        self.web_search_tool = WebSearchTool()
        self.summarizer_tool = SummarizerTool(self.llm)
        
        # Load configuration from YAML files
        self.config_dir = Path(__file__).parent
        self.agents_config = self._load_yaml(self.config_dir / "agents.yaml")
        self.tasks_config = self._load_yaml(self.config_dir / "tasks.yaml")
        
        logging.info("NewsCrewManager initialized with Gemini LLM and YAML configs")
    
    def _load_yaml(self, file_path: Path) -> Dict[str, Any]:
        """Load and parse a YAML configuration file."""
        try:
            with open(file_path, 'r') as file:
                config = yaml.safe_load(file)
                logging.info(f"Loaded configuration from {file_path}")
                return config
        except Exception as e:
            logging.error(f"Failed to load {file_path}: {e}")
            raise
    
    def _create_agent_from_config(self, agent_name: str, tools: List = None) -> Agent:
        """
        Create an agent from YAML configuration.
        
        Args:
            agent_name: Name of the agent in the YAML config
            tools: List of tools to give the agent
            
        Returns:
            Configured Agent instance
        """
        if agent_name not in self.agents_config:
            raise ValueError(f"Agent '{agent_name}' not found in agents.yaml")
        
        config = self.agents_config[agent_name]
        
        return Agent(
            role=config["role"],
            goal=config["goal"],
            backstory=config["backstory"],
            tools=tools or [],
            llm=self.llm,
            verbose=config.get("verbose", True),
            allow_delegation=config.get("allow_delegation", False)
        )
    
    def _create_task_from_config(
        self, 
        task_name: str, 
        agent: Agent, 
        context: List[Task] = None,
        **kwargs
    ) -> Task:
        """
        Create a task from YAML configuration.
        
        Args:
            task_name: Name of the task in the YAML config
            agent: Agent to assign the task to
            context: List of tasks this task depends on
            **kwargs: Variables to format the task description
            
        Returns:
            Configured Task instance
        """
        if task_name not in self.tasks_config:
            raise ValueError(f"Task '{task_name}' not found in tasks.yaml")
        
        config = self.tasks_config[task_name]
        
        # Format description and expected_output with provided variables
        description = config["description"].format(**kwargs)
        expected_output = config["expected_output"].format(**kwargs)
        
        return Task(
            description=description,
            agent=agent,
            expected_output=expected_output,
            context=context or []
        )
    
    def generate_news_articles(
        self, 
        audience: str, 
        topic: str, 
        max_articles: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate news articles using the appropriate crew based on audience.
        
        Args:
            audience: "medical" or "patient"
            topic: Search topic
            max_articles: Maximum number of articles to generate
            
        Returns:
            List of article dictionaries
        """
        logging.info(f"Generating {max_articles} articles for {audience} audience")
        
        if audience == "medical":
            return self._generate_medical_news(topic, max_articles)
        else:
            return self._generate_patient_news(topic, max_articles)
    
    def _generate_medical_news(self, topic: str, max_articles: int) -> List[Dict[str, Any]]:
        """Generate medical research news from arXiv using YAML-configured agents and tasks."""
        
        # Create agents from YAML config
        researcher = self._create_agent_from_config("medical_researcher", tools=[self.arxiv_tool])
        summarizer = self._create_agent_from_config("summarizer", tools=[self.summarizer_tool])
        
        # Create tasks from YAML config
        research_task = self._create_task_from_config(
            "medical_research_task",
            agent=researcher,
            topic=topic,
            max_articles=max_articles
        )
        
        summary_task = self._create_task_from_config(
            "medical_summary_task",
            agent=summarizer,
            context=[research_task],
            max_articles=max_articles
        )
        
        # Create and run the crew
        crew = Crew(
            agents=[researcher, summarizer],
            tasks=[research_task, summary_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Parse the result and return structured data
        articles = self._parse_crew_result(str(result), audience="medical")
        return articles[:max_articles]
    
    def _generate_patient_news(self, topic: str, max_articles: int) -> List[Dict[str, Any]]:
        """Generate patient-friendly news articles using YAML-configured agents and tasks."""
        
        # Create agents from YAML config
        researcher = self._create_agent_from_config("patient_researcher", tools=[self.web_search_tool])
        summarizer = self._create_agent_from_config("summarizer", tools=[self.summarizer_tool])
        
        # Create tasks from YAML config
        research_task = self._create_task_from_config(
            "patient_research_task",
            agent=researcher,
            topic=topic,
            max_articles=max_articles
        )
        
        summary_task = self._create_task_from_config(
            "patient_summary_task",
            agent=summarizer,
            context=[research_task],
            max_articles=max_articles
        )
        
        # Create and run the crew
        crew = Crew(
            agents=[researcher, summarizer],
            tasks=[research_task, summary_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Parse the result and return structured data
        articles = self._parse_crew_result(str(result), audience="patient")
        return articles[:max_articles]
    
    def calculate_risk(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate dementia risk for a patient using YAML-configured Risk Calculator Agent.
        
        Args:
            patient_data: Patient assessment data including questionnaire, 
                         transcription, cognitive test results
                         
        Returns:
            Risk assessment dictionary
        """
        logging.info("Calculating dementia risk assessment")
        
        # Create the risk calculator agent from YAML config
        risk_agent = self._create_agent_from_config("risk_calculator")
        
        # Create the risk assessment task from YAML config
        risk_task = self._create_task_from_config(
            "risk_assessment_task",
            agent=risk_agent,
            patient_data=patient_data
        )
        
        # Create and run the crew
        crew = Crew(
            agents=[risk_agent],
            tasks=[risk_task],
            process=Process.sequential,
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Parse and return the risk assessment
        assessment = self._parse_risk_assessment(str(result))
        return assessment
    
    def _parse_crew_result(self, result: str, audience: str) -> List[Dict[str, Any]]:
        """
        Parse the crew result into structured article data.
        This is a simplified parser - in production, you'd want more robust parsing.
        """
        import json
        import re
        
        articles = []
        
        try:
            # Try to extract JSON from the result
            json_match = re.search(r'\[.*\]', result, re.DOTALL)
            if json_match:
                articles = json.loads(json_match.group())
            else:
                # Fallback: create a basic structure if JSON parsing fails
                logging.warning("Could not parse JSON from crew result, using fallback")
                articles = [{
                    "topic": "Cognitive Health" if audience == "patient" else "Neurology",
                    "title": "Research Update on Dementia",
                    "sourceUrl": "https://arxiv.org/ ",
                    "readTime": "5 min",
                    "agentSummary": result[:500] + "..."
                }]
        except Exception as e:
            logging.error(f"Error parsing crew result: {e}")
            articles = []
        
        return articles
    
    def _parse_risk_assessment(self, result: str) -> Dict[str, Any]:
        """Parse the risk assessment result."""
        import json
        import re
        
        try:
            # Try to extract JSON from the result
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                assessment = json.loads(json_match.group())
            else:
                # Fallback structure
                assessment = {
                    "riskScore": 50,
                    "riskLevel": "Moderate",
                    "explanation": "Unable to complete full assessment. Please consult a healthcare professional.",
                    "recommendations": ["Consult with a healthcare provider", "Maintain a healthy lifestyle"]
                }
        except Exception as e:
            logging.error(f"Error parsing risk assessment: {e}")
            assessment = {
                "riskScore": 0,
                "riskLevel": "Unknown",
                "explanation": f"Error processing assessment: {str(e)}",
                "recommendations": ["Please retry assessment", "Consult healthcare provider"]
            }
        
        return assessment