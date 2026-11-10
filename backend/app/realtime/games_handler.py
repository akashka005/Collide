import json
from typing import Optional, List, Dict, Any, Literal
from app.services.redis_client import get_redis
TRIVIA_BANK = [
    {
        "id": "t-1",
        "category": "Pop Culture & Gaming",
        "question": "In Minecraft, what is the rare structure found floating in the End dimension?",
        "options": ["End Fortress", "End City", "Void Citadel", "Dragon Roost"],
        "correctAnswer": 1,
    },
    {
        "id": "t-2",
        "category": "Science & Cosmos",
        "question": "Which planet in our solar system has the most moons confirmed by astronomers?",
        "options": ["Jupiter", "Saturn", "Uranus", "Neptune"],
        "correctAnswer": 1,
    },
    {
        "id": "t-3",
        "category": "Cinema & Anime",
        "question": "Which Studio Ghibli film features the magical flying bathhouse and No-Face?",
        "options": ["Howl's Moving Castle", "Spirited Away", "Princess Mononoke", "Kiki's Delivery Service"],
        "correctAnswer": 1,
    },
    {
        "id": "t-4",
        "category": "Tech & Music",
        "question": "What year did Spotify officially launch to the public?",
        "options": ["2006", "2008", "2010", "2012"],
        "correctAnswer": 1,
    },
    {
        "id": "t-5",
        "category": "World Mysteries",
        "question": "What is the deepest known oceanic trench on Earth?",
        "options": ["Tonga Trench", "Puerto Rico Trench", "Mariana Trench", "Java Trench"],
        "correctAnswer": 2,
    },
]
WOULD_YOU_RATHER_BANK = [
    {
        "id": "wyr-1",
        "optionA": "Live 100 years in the past with full modern knowledge",
        "optionB": "Live 100 years into the future knowing nothing about what happened",
        "votesA": 42,
        "votesB": 58,
    },
    {
        "id": "wyr-2",
        "optionA": "Never have to sleep again with zero fatigue",
        "optionB": "Be able to teleport anywhere instantly once per day",
        "votesA": 37,
        "votesB": 63,
    },
    {
        "id": "wyr-3",
        "optionA": "Always have the perfect witty comeback on the spot",
        "optionB": "Always know when someone is telling a white lie",
        "votesA": 55,
        "votesB": 45,
    },
    {
        "id": "wyr-4",
        "optionA": "Explore the deepest unexplored trenches of the ocean",
        "optionB": "Explore an uncharted habitable exoplanet in space",
        "votesA": 28,
        "votesB": 72,
    },
]

def check_tictactoe_winner(board: List[Optional[str]]) -> Optional[str]:
    lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ]
    for a, b, c in lines:
        if board[a] and board[a] == board[b] and board[a] == board[c]:
            return board[a]
    if all(cell is not None for cell in board):
        return "tie"
    return None


class GamesHandler:
    async def get_game_state(self, room_id: str, game_type: str) -> Optional[Dict[str, Any]]:
        redis = await get_redis()
        raw = await redis.get(f"game:{room_id}:{game_type}")
        return json.loads(raw) if raw else None

    async def init_game(self, room_id: str, game_type: str, starter_id: str) -> Dict[str, Any]:
        redis = await get_redis()
        if game_type == "tictactoe":
            state = {
                "board": [None] * 9,
                "currentTurn": "X",
                "winner": None,
                "starterId": starter_id,
                "scores": {"X": 0, "O": 0, "ties": 0},
            }
        elif game_type == "trivia":
            state = {
                "currentIndex": 0,
                "question": TRIVIA_BANK[0],
                "scores": {},
                "answers": {},
            }
        elif game_type == "wyr":
            state = {
                "currentIndex": 0,
                "prompt": WOULD_YOU_RATHER_BANK[0],
                "choices": {},
            }
        else:
            state = {}

        await redis.set(f"game:{room_id}:{game_type}", json.dumps(state), ex=3600)
        return state

    async def handle_tictactoe_move(
        self,
        room_id: str,
        user_id: str,
        cell_index: int,
        symbol: str
    ) -> Optional[Dict[str, Any]]:
        redis = await get_redis()
        raw = await redis.get(f"game:{room_id}:tictactoe")
        if not raw:
            return None

        state = json.loads(raw)
        board = state.get("board", [None] * 9)

        if cell_index < 0 or cell_index >= 9 or board[cell_index] is not None or state.get("winner") is not None:
            return state

        board[cell_index] = symbol
        winner = check_tictactoe_winner(board)

        state["board"] = board
        state["currentTurn"] = "O" if symbol == "X" else "X"
        state["winner"] = winner

        if winner:
            scores = state.setdefault("scores", {"X": 0, "O": 0, "ties": 0})
            if winner in scores:
                scores[winner] += 1
            elif winner == "tie":
                scores["ties"] += 1

        await redis.set(f"game:{room_id}:tictactoe", json.dumps(state), ex=3600)
        return state

    async def reset_tictactoe(self, room_id: str) -> Optional[Dict[str, Any]]:
        redis = await get_redis()
        raw = await redis.get(f"game:{room_id}:tictactoe")
        if not raw:
            return None
        state = json.loads(raw)
        state["board"] = [None] * 9
        state["currentTurn"] = "X"
        state["winner"] = None
        await redis.set(f"game:{room_id}:tictactoe", json.dumps(state), ex=3600)
        return state
games_handler = GamesHandler()