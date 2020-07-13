all:
	uvicorn battleship.asgi:application --reload --host 0.0.0.0