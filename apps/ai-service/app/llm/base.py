"""
app/llm/base.py — Abstract LLM provider interface.
Defines the contract every LLM provider must implement.
Currently only Gemini is used, but this interface allows future providers
(e.g., OpenAI, Anthropic) to be swapped in without touching pipeline code.
"""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate_json(
        self,
        prompt: str,
        response_schema: dict,
        *,
        temperature: float = 0.1,
    ) -> dict | None:
        """Send a prompt and return a parsed JSON response validated against the schema.

        Args:
            prompt: The full prompt to send to the model.
            response_schema: JSON Schema dict the model must conform to.
            temperature: Sampling temperature (lower = more deterministic).

        Returns:
            Parsed dict from the model's response, or None if parsing fails.

        Raises:
            LLMError: If the API call fails after all retries.
        """
        ...
