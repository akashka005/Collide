from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field
class TicTacToeScores(BaseModel):
    X: int = 0
    O: int = 0
    ties: int = 0
class TicTacToeState(BaseModel):
    board: List[Optional[Literal["X", "O"]]] = Field(default_factory=lambda: [None] * 9)
    currentTurn: Literal["X", "O"] = "X"
    winner: Optional[Literal["X", "O", "tie"]] = None
    mySymbol: Literal["X", "O"] = "X"
    scores: TicTacToeScores = Field(default_factory=TicTacToeScores)
class TicTacToeMoveRequest(BaseModel):
    cellIndex: int
class TriviaQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correctAnswer: int
    category: str
class TriviaAnswerRequest(BaseModel):
    questionId: str
    optionIndex: int
class TriviaScoreSync(BaseModel):
    scores: Dict[str, int]
    partnerAnswer: Optional[int] = None
class WouldYouRatherPrompt(BaseModel):
    id: str
    optionA: str
    optionB: str
    votesA: int = 0
    votesB: int = 0
class WyrVoteRequest(BaseModel):
    promptId: str
    choice: Literal["A", "B"]