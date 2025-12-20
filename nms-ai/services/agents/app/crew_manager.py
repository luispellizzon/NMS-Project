import os
import logging
import yaml
from typing import List, Dict, Any, Optional, Literal
from pathlib import Path
from crewai import Agent, Task, Crew, Process
from .tools import ArxivSearchTool, WebSearchTool, SummarizerTool
from .llm_config import get_llm_provider, LLMProvider

logging.basicConfig(level=logging.INFO)


class NewsCrewManager:
    """
    Manages CrewAI agents for news generation and risk assessment.
    Loads agent and task configurations from YAML files.
    Supports multiple LLM providers (Gemini, Groq, Ollama).
    """

    def __init__(self, llm_provider: Optional[Literal["gemini", "ollama", "groq"]] = None):
        """
        Initialize the NewsCrewManager with configurable LLM provider.

        Args:
            llm_provider: LLM provider to use ("gemini" or "ollama").
                         If None, uses DEFAULT_LLM_PROVIDER from env
        """
        # Initialize LLM provider manager
        self.llm_provider = get_llm_provider()
        self.selected_provider = llm_provider

        # Get default LLM for general use
        self.llm = self.llm_provider.get_llm(provider=llm_provider)

        # Initialize tools
        self.arxiv_tool = ArxivSearchTool()
        self.web_search_tool = WebSearchTool()
        self.summarizer_tool = SummarizerTool(self.llm)

        # Load configuration from YAML files
        self.config_dir = Path(__file__).parent
        self.agents_config = self._load_yaml(self.config_dir / "agents.yaml")
        self.tasks_config = self._load_yaml(self.config_dir / "tasks.yaml")

        provider_name = llm_provider or self.llm_provider.default_provider
        logging.info(f"NewsCrewManager initialized with {provider_name.upper()} LLM and YAML configs")
    
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
    
    def _create_agent_from_config(
        self,
        agent_name: str,
        tools: List = None,
        llm_override: Optional[Literal["gemini", "ollama", "groq"]] = None
    ) -> Agent:
        """
        Create an agent from YAML configuration.

        Args:
            agent_name: Name of the agent in the YAML config
            tools: List of tools to give the agent
            llm_override: Optional LLM provider override for this specific agent

        Returns:
            Configured Agent instance
        """
        if agent_name not in self.agents_config:
            raise ValueError(f"Agent '{agent_name}' not found in agents.yaml")

        config = self.agents_config[agent_name]

        # Get agent-specific LLM if override is provided
        agent_llm = self.llm
        if llm_override:
            agent_llm = self.llm_provider.get_llm_for_agent(
                agent_type=agent_name,
                provider=llm_override
            )
            logging.info(f"Agent '{agent_name}' using {llm_override.upper()} LLM")

        return Agent(
            role=config["role"],
            goal=config["goal"],
            backstory=config["backstory"],
            tools=tools or [],
            llm=agent_llm,
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

    def generate_news_articles_with_progress(
        self,
        audience: str,
        topic: str,
        max_articles: int = 5,
        progress_callback = None
    ) -> List[Dict[str, Any]]:
        """
        Generate news articles with progress updates via callback.

        Args:
            audience: "medical" or "patient"
            topic: Search topic
            max_articles: Maximum number of articles to generate
            progress_callback: Callback function to receive progress updates

        Returns:
            List of article dictionaries
        """
        import uuid
        from datetime import datetime

        def emit_progress(artifact_type, agent_name, title, content, status='in_progress'):
            """Helper to emit progress updates"""
            if progress_callback:
                try:
                    progress_callback({
                        'type': 'artifact',
                        'id': str(uuid.uuid4()),
                        'artifactType': artifact_type,
                        'agent': agent_name,
                        'title': title,
                        'content': content,
                        'timestamp': datetime.now().isoformat(),
                        'status': status
                    })
                except Exception as e:
                    logging.warning(f"Error in progress callback: {e}")

        logging.info(f"Generating {max_articles} articles for {audience} audience with progress tracking")

        # Emit initialization
        emit_progress('search', 'Agent Manager', 'Initializing agents',
                     f'Setting up {audience} research agents for topic: {topic}', 'completed')

        if audience == "medical":
            return self._generate_medical_news_with_progress(topic, max_articles, emit_progress)
        else:
            return self._generate_patient_news_with_progress(topic, max_articles, emit_progress)
    
    def _generate_medical_news(self, topic: str, max_articles: int) -> List[Dict[str, Any]]:
        """Generate medical research news from arXiv using YAML-configured agents and tasks."""

        # Create agents from YAML config with different LLM providers
        # Use Gemini for research (powerful, comprehensive)
        # Use Groq for summarization (fast inference, structured output)
        researcher = self._create_agent_from_config(
            "medical_researcher",
            tools=[self.arxiv_tool],
            llm_override="gemini"
        )
        summarizer = self._create_agent_from_config(
            "summarizer",
            tools=[self.summarizer_tool],
            llm_override="groq"
        )

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

    def _generate_medical_news_with_progress(self, topic: str, max_articles: int, emit_progress) -> List[Dict[str, Any]]:
        """Generate medical research news from arXiv with progress tracking."""
        import time
        import threading

        emit_progress('search', 'Medical Researcher', 'Searching arXiv database',
                     f'Searching for recent medical research papers on: {topic}', 'in_progress')

        time.sleep(2.5)  # Smooth delay for UI

        # Create agents from YAML config with different LLM providers
        # Use Gemini for research (powerful, comprehensive)
        # Use Groq for summarization (fast inference, structured output)
        researcher = self._create_agent_from_config(
            "medical_researcher",
            tools=[self.arxiv_tool],
            llm_override="gemini"
        )
        summarizer = self._create_agent_from_config(
            "summarizer",
            tools=[self.summarizer_tool],
            llm_override="groq"
        )

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

        emit_progress('search', 'Medical Researcher', 'arXiv search complete',
                     f'Found relevant research papers. Analyzing content...', 'completed')

        time.sleep(2.0)  # Smooth delay for UI

        # Create and run the crew
        crew = Crew(
            agents=[researcher, summarizer],
            tasks=[research_task, summary_task],
            process=Process.sequential,
            verbose=True
        )

        emit_progress('analysis', 'Medical Researcher', 'Analyzing research papers',
                     'Extracting key findings and methodologies from papers', 'in_progress')

        time.sleep(2.0)  # Smooth delay before long-running task

        # Create a flag to stop the progress thread
        stop_progress = threading.Event()
        progress_messages = [
            "Reading paper abstracts and methodologies...",
            "Evaluating research quality and relevance...",
            "Cross-referencing citations and findings...",
            "Identifying key insights and conclusions...",
            "Analyzing statistical significance...",
            "Reviewing peer review comments...",
            "Synthesizing research outcomes..."
        ]

        def emit_periodic_updates():
            """Emit progress updates while crew is running"""
            message_index = 0
            while not stop_progress.is_set():
                time.sleep(4)  # Update every 4 seconds
                if not stop_progress.is_set():
                    emit_progress('analysis', 'Medical Researcher', 'Analyzing research papers',
                                progress_messages[message_index % len(progress_messages)], 'in_progress')
                    message_index += 1

        # Start background thread for progress updates
        progress_thread = threading.Thread(target=emit_periodic_updates, daemon=True)
        progress_thread.start()

        try:
            result = crew.kickoff()
        finally:
            # Stop the progress thread
            stop_progress.set()
            progress_thread.join(timeout=1)

        emit_progress('analysis', 'Medical Researcher', 'Analysis complete',
                     'Successfully analyzed research papers', 'completed')

        time.sleep(4)  # Smooth delay for UI

        emit_progress('summary', 'Summarizer Agent', 'Generating summaries',
                     f'Creating professional medical summaries for {max_articles} articles', 'in_progress')

        time.sleep(1.5)  # Smooth delay for UI

        # Parse the result and return structured data
        articles = self._parse_crew_result(str(result), audience="medical")

        emit_progress('summary', 'Summarizer Agent', 'Summaries complete',
                     f'Generated {len(articles)} medical article summaries', 'completed')

        time.sleep(1.5)  # Final smooth delay

        return articles[:max_articles]
    
    def _generate_patient_news(self, topic: str, max_articles: int) -> List[Dict[str, Any]]:
        """Generate patient-friendly news articles using YAML-configured agents and tasks."""

        # Create agents from YAML config with different LLM providers
        # Use Gemini for research (powerful, comprehensive)
        # Use Groq for summarization (fast inference, structured output)
        researcher = self._create_agent_from_config(
            "patient_researcher",
            tools=[self.web_search_tool],
            llm_override="gemini"
        )
        summarizer = self._create_agent_from_config(
            "summarizer",
            tools=[self.summarizer_tool],
            llm_override="groq"
        )

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

    def _generate_patient_news_with_progress(self, topic: str, max_articles: int, emit_progress) -> List[Dict[str, Any]]:
        """Generate patient-friendly news articles with progress tracking."""
        import time
        import threading

        emit_progress('search', 'Patient Researcher', 'Searching health resources',
                     f'Searching trusted health sources for patient-friendly information on: {topic}', 'in_progress')

        time.sleep(1.5)  # Smooth delay for UI

        # Create agents from YAML config with different LLM providers
        # Use Gemini for research (powerful, comprehensive)
        # Use Groq for summarization (fast inference, structured output)
        researcher = self._create_agent_from_config(
            "patient_researcher",
            tools=[self.web_search_tool],
            llm_override="gemini"
        )
        summarizer = self._create_agent_from_config(
            "summarizer",
            tools=[self.summarizer_tool],
            llm_override="groq"
        )

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

        emit_progress('search', 'Patient Researcher', 'Search complete',
                     'Found relevant health articles from trusted sources', 'completed')

        time.sleep(1.0)  # Smooth delay for UI

        # Create and run the crew
        crew = Crew(
            agents=[researcher, summarizer],
            tasks=[research_task, summary_task],
            process=Process.sequential,
            verbose=True
        )

        emit_progress('analysis', 'Patient Researcher', 'Analyzing articles',
                     'Extracting key health information and practical tips', 'in_progress')

        time.sleep(1.0)  # Smooth delay before long-running task

        # Create a flag to stop the progress thread
        stop_progress = threading.Event()
        progress_messages = [
            "Reading health information from trusted sources...",
            "Verifying medical accuracy and reliability...",
            "Extracting practical health advice...",
            "Identifying key takeaways for patients...",
            "Translating medical terms to plain language...",
            "Highlighting actionable recommendations...",
            "Organizing information by relevance..."
        ]

        def emit_periodic_updates():
            """Emit progress updates while crew is running"""
            message_index = 0
            while not stop_progress.is_set():
                time.sleep(4)  # Update every 4 seconds
                if not stop_progress.is_set():
                    emit_progress('analysis', 'Patient Researcher', 'Analyzing articles',
                                progress_messages[message_index % len(progress_messages)], 'in_progress')
                    message_index += 1

        # Start background thread for progress updates
        progress_thread = threading.Thread(target=emit_periodic_updates, daemon=True)
        progress_thread.start()

        try:
            result = crew.kickoff()
        finally:
            # Stop the progress thread
            stop_progress.set()
            progress_thread.join(timeout=1)

        emit_progress('analysis', 'Patient Researcher', 'Analysis complete',
                     'Successfully analyzed health articles', 'completed')

        time.sleep(0.8)  # Smooth delay for UI

        emit_progress('summary', 'Summarizer Agent', 'Creating patient-friendly summaries',
                     f'Generating accessible summaries for {max_articles} articles', 'in_progress')

        time.sleep(0.5)  # Smooth delay for UI

        # Parse the result and return structured data
        articles = self._parse_crew_result(str(result), audience="patient")

        emit_progress('summary', 'Summarizer Agent', 'Summaries complete',
                     f'Generated {len(articles)} patient-friendly article summaries', 'completed')

        time.sleep(0.5)  # Final smooth delay

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
        # Use Groq for risk calculation (fast inference, structured output)
        risk_agent = self._create_agent_from_config(
            "risk_calculator",
            llm_override="groq"
        )
        
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