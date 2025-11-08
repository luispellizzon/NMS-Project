from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from datetime import datetime
import uuid

@CrewBase
class DementiaNewsCrew():
    """Dementia News generation crew"""
    
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'
    
    @agent
    def dementia_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['dementia_researcher'],
            verbose=True
        )
    
    @agent
    def medical_writer(self) -> Agent:
        return Agent(
            config=self.agents_config['medical_writer'],
            verbose=True
        )
    
    @agent
    def fact_checker(self) -> Agent:
        return Agent(
            config=self.agents_config['fact_checker'],
            verbose=True
        )
    
    @task
    def research_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_task']
        )
    
    @task
    def writing_task(self) -> Task:
        return Task(
            config=self.tasks_config['writing_task']
        )
    
    @task
    def editing_task(self) -> Task:
        return Task(
            config=self.tasks_config['editing_task']
        )
    
    @crew
    def crew(self) -> Crew:
        """Creates the Dementia News crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
    
    def generate_article(self, topic: str, article_type: str = "general", 
                        target_audience: str = "families") -> dict:
        """
        Generate a dementia article and format as NewsArticle
        
        Returns dict matching NewsArticle format for webapp
        """
        # Run the crew
        inputs = {
            "topic": topic,
            "article_type": article_type,
            "target_audience": target_audience
        }
        
        result = self.crew().kickoff(inputs=inputs)
        
        # Parse result into NewsArticle format
        return self._format_as_news_article(str(result), topic, article_type)
    
    def _format_as_news_article(self, output: str, topic: str, 
                                article_type: str) -> dict:
        """Format crew output as NewsArticle for webapp"""
        lines = output.split('\n')
        
        title = ""
        summary = ""
        content = ""
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith("TITLE:"):
                current_section = "title"
                title = line.replace("TITLE:", "").strip()
            elif line.startswith("SUMMARY:"):
                current_section = "summary"
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("CONTENT:"):
                current_section = "content"
                content = line.replace("CONTENT:", "").strip()
            elif line and current_section:
                if current_section == "title":
                    title += " " + line
                elif current_section == "summary":
                    summary += " " + line
                elif current_section == "content":
                    content += "\n" + line
        
        # Fallbacks
        if not title:
            title = topic.title()
        if not summary:
            summary = content[:200] + "..."
        if not content:
            content = output
        
        # Calculate read time
        word_count = len(content.split())
        read_time = max(1, round(word_count / 200))
        
        # Generate tags
        tags = ["Dementia", "Alzheimer's"]
        if article_type == "research":
            tags.extend(["Research", "Medical Science"])
        elif article_type == "caregiving":
            tags.extend(["Caregiving", "Support"])
        elif article_type == "treatment":
            tags.extend(["Treatment", "Therapy"])
        elif article_type == "prevention":
            tags.extend(["Prevention", "Brain Health"])
        
        # Map to category
        category_map = {
            "research": "research",
            "caregiving": "caregiving",
            "treatment": "treatment",
            "prevention": "lifestyle",
            "symptoms": "health",
            "lifestyle": "lifestyle",
            "general": "health"
        }
        
        # Return NewsArticle format
        return {
            "id": f"dementia-{uuid.uuid4().hex[:8]}",
            "title": title.strip(),
            "summary": summary.strip(),
            "content": content.strip(),
            "author": "Dementia News Team",
            "publishedAt": datetime.utcnow().isoformat() + "Z",
            "category": category_map.get(article_type, "health"),
            "tags": tags[:6],
            "imageUrl": f"https://picsum.photos/seed/{uuid.uuid4().hex[:8]}/800/600",
            "source": "Dementia News Network",
            "readTime": read_time
        }