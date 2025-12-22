# services/agents/app/llm_config.py
import os
import logging
from typing import Literal, Optional
from crewai import LLM

logging.basicConfig(level=logging.INFO)


class LLMProvider:
    """
    Manages multiple LLM providers for the NMS agents system.
    Supports Gemini API, Groq, and Ollama (locally-hosted models).
    """

    def __init__(self):
        """Initialize LLM provider with environment variables."""
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_model = os.getenv("GROQ_MODEL", "moonshotai/kimi-k2-instruct")
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2")

        # Default LLM provider
        self.default_provider = os.getenv("DEFAULT_LLM_PROVIDER", "gemini")

        logging.info(f"LLMProvider initialized with default provider: {self.default_provider}")

    def get_llm(
        self,
        provider: Optional[Literal["gemini", "ollama", "groq"]] = None,
        temperature: float = 0.7,
        timeout: float = 60.0,
        max_retries: int = 3
    ) -> LLM:
        """
        Get an LLM instance for the specified provider.

        Args:
            provider: LLM provider to use ("gemini", "ollama", or "groq").
                     If None, uses DEFAULT_LLM_PROVIDER from env
            temperature: Sampling temperature (0-1)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts

        Returns:
            Configured LLM instance

        Raises:
            ValueError: If provider is not configured or API keys are missing
        """
        provider = provider or self.default_provider

        if provider == "gemini":
            return self._get_gemini_llm(temperature, timeout, max_retries)
        elif provider == "ollama":
            return self._get_ollama_llm(temperature, timeout, max_retries)
        elif provider == "groq":
            return self._get_groq_llm(temperature, timeout, max_retries)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}. Use 'gemini', 'ollama', or 'groq'")

    def _get_gemini_llm(
        self,
        temperature: float,
        timeout: float,
        max_retries: int
    ) -> LLM:
        """
        Get a Gemini LLM instance.

        Returns:
            Configured Gemini LLM

        Raises:
            ValueError: If GEMINI_API_KEY is not set
        """
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

        logging.info("Initializing Gemini LLM")

        return LLM(
            model="gemini/gemini-2.0-flash-exp",
            api_key=self.gemini_api_key,
            temperature=temperature,
            timeout=timeout,
            max_retries=max_retries,
            retry_config={"max_wait": 30, "exponential_base": 2}
        )

    def _get_ollama_llm(
        self,
        temperature: float,
        timeout: float,
        max_retries: int
    ) -> LLM:
        """
        Get an Ollama LLM instance (locally-hosted model).

        Returns:
            Configured Ollama LLM

        Note:
            Make sure Ollama is running locally before using this.
            Install Ollama from: https://ollama.ai/
            Pull a model with: ollama pull llama3.2
        """
        logging.info(f"Initializing Ollama LLM with model: {self.ollama_model}")
        logging.info(f"Ollama base URL: {self.ollama_base_url}")

        return LLM(
            model=f"ollama/{self.ollama_model}",
            base_url=self.ollama_base_url,
            temperature=temperature,
            timeout=timeout,
            max_retries=max_retries
        )

    def _get_groq_llm(
        self,
        temperature: float,
        timeout: float,
        max_retries: int
    ) -> LLM:
        """
        Get a Groq LLM instance (2nd online LLM - fast inference).

        Returns:
            Configured Groq LLM

        Raises:
            ValueError: If GROQ_API_KEY is not set

        Note:
            Get API key from: https://console.groq.com/
            Models: moonshotai/kimi-k2-instruct (default), llama-3.3-70b-versatile, mixtral-8x7b-32768
        """
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")

        logging.info(f"Initializing Groq LLM with model: {self.groq_model}")

        return LLM(
            model=f"groq/{self.groq_model}",
            api_key=self.groq_api_key,
            temperature=temperature,
            timeout=timeout,
            max_retries=max_retries
        )

    def get_llm_for_agent(
        self,
        agent_type: Literal["medical_researcher", "patient_researcher", "risk_calculator", "summarizer"],
        provider: Optional[Literal["gemini", "ollama", "groq"]] = None
    ) -> LLM:
        """
        Get an LLM instance optimized for a specific agent type.

        This method allows you to assign different LLMs to different agents based on their needs.
        For example:
        - Use Gemini for medical research (more powerful, cloud-based)
        - Use Groq for summarization (fast inference, structured output)
        - Use Ollama for patient news (privacy-focused, local)

        Args:
            agent_type: Type of agent requesting the LLM
            provider: Optional override for LLM provider

        Returns:
            Configured LLM instance
        """
        # You can customize LLM selection based on agent type
        # For example, use more powerful models for medical research
        if agent_type == "medical_researcher":
            # Medical research benefits from more powerful models
            temperature = 0.5  # Lower temperature for more factual responses
            timeout = 90.0  # Longer timeout for complex queries
        elif agent_type == "risk_calculator":
            # Risk calculation needs precision
            temperature = 0.3
            timeout = 60.0
        elif agent_type == "summarizer":
            # Summarization can use slightly higher creativity
            temperature = 0.7
            timeout = 60.0
        else:  # patient_researcher
            # Patient content can be more conversational
            temperature = 0.7
            timeout = 60.0

        return self.get_llm(
            provider=provider,
            temperature=temperature,
            timeout=timeout,
            max_retries=3
        )

    def test_connection(self, provider: Optional[Literal["gemini", "ollama", "groq"]] = None) -> bool:
        """
        Test connection to the specified LLM provider.

        Args:
            provider: LLM provider to test

        Returns:
            True if connection successful, False otherwise
        """
        try:
            provider = provider or self.default_provider
            llm = self.get_llm(provider=provider)

            # Try a simple test prompt
            test_response = llm.call(
                messages=[{"role": "user", "content": "Say 'Hello' if you can read this."}]
            )

            logging.info(f"✓ {provider.upper()} connection test successful")
            return True
        except Exception as e:
            logging.error(f"✗ {provider.upper()} connection test failed: {e}")
            return False


# Singleton instance for easy access
_llm_provider_instance = None


def get_llm_provider() -> LLMProvider:
    """
    Get the singleton LLMProvider instance.

    Returns:
        Configured LLMProvider
    """
    global _llm_provider_instance
    if _llm_provider_instance is None:
        _llm_provider_instance = LLMProvider()
    return _llm_provider_instance