import random
from typing import List, Optional
from app.core.config import settings
from app.core.logging import logger

FALLBACK_ICEBREAKERS = [
    "What's the best concert or festival you've ever experienced in person?",
    "If you could instantly speak any language fluently tomorrow, which one?",
    "What is a movie or game you wish you could experience again for the first time?",
    "What weird food combination do you love that other people judge?",
    "What's the most scenic place you've ever visited?",
    "If you had a free weekend with no responsibilities, what would you spend it doing?",
    "What obscure topic could you give an impromptu 20-minute TED talk about?",
    "If you could have dinner with any historical figure, who would it be and why?",
    "What's a skill you recently started learning and what got you into it?",
    "What's your unpopular opinion about something everyone else loves?",
    "If you could live in any fictional universe for a week, which one?",
    "What's the most spontaneous thing you've ever done?",
]


class CopilotService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL

    async def generate_icebreakers(self, shared_interests: Optional[List[str]] = None) -> List[str]:
        if not self.api_key:
            return random.sample(FALLBACK_ICEBREAKERS, min(4, len(FALLBACK_ICEBREAKERS)))

        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            interests_str = ", ".join(shared_interests) if shared_interests else "general curiosity and new experiences"
            prompt = (
                f"Generate 4 friendly, engaging, open-ended conversation icebreaker questions for two strangers meeting online. "
                f"Their shared interests are: {interests_str}. "
                "Rules: Keep each under 20 words. Make them witty, fun, and non-awkward. "
                "Output ONLY the 4 questions, one per line, no numbering, no quotes, no extra text."
            )
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a friendly conversation assistant. Generate short, engaging icebreaker questions. Output only the questions, one per line.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.85,
                max_tokens=200,
            )
            if response.choices and response.choices[0].message.content:
                raw = response.choices[0].message.content.strip()
                lines = [
                    line.strip().lstrip("0123456789.-) ").strip().strip("\"'")
                    for line in raw.split("\n")
                    if line.strip() and len(line.strip()) > 10
                ]
                if len(lines) >= 2:
                    return lines[:4]
        except Exception as e:
            logger.warning(f"Groq Copilot error ({e}), falling back to curated prompts.")

        return random.sample(FALLBACK_ICEBREAKERS, min(4, len(FALLBACK_ICEBREAKERS)))


copilot_service = CopilotService()
