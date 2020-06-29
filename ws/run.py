import asyncio
import websockets
import json

sessions = {

}

async def hello(websocket, path):
    while True:
        command_str = await websocket.recv()
        print(f"< {command_str}")
        command = json.loads(command_str)
        if command["command"] == "receiver":
            sessions[command["id"]] = {
                "state": "listen",
                "receiver": websocket,
            }
            result = "ok"
            result = {
                "response": result
            }
            await websocket.send(json.dumps(result))
        elif command["command"] == "client":
            session = sessions.get(command["id"])
            if session:
                if session["state"] == "listen":
                    session["state"] = "connected"
                    session["client"] = websocket
                    result = "ok"
                else:
                    result = "wrong state"
            else:
                result = "no session"
            result = {
                "response": result
            }
            await websocket.send(json.dumps(result))
        elif command["command"] == "request":
            session = None
            for session_id, session_state in sessions.items():
                if session_state["client"] == websocket:
                    session = session_state
                    break
            if session:
                if session["receiver"]:
                    await session["receiver"].send(command_str)
                    result = "ok"
                else:
                    result = "no receiver"
            else:
                result = "no session"
            result = {
                "response": result
            }
            await websocket.send(json.dumps(result))
        elif command["command"] == "response":
            session = None
            for session_id, session_state in sessions.items():
                if session_state["receiver"] == websocket:
                    session = session_state
                    break
            if session:
                if session["client"]:
                    await session["client"].send(command_str)
                    result = "ok"
                else:
                    result = "no client"
            else:
                result = "no session"
            result = {
                "response": result
            }
            await websocket.send(json.dumps(result))
        else:
            result = "unknown command"
            result = {
                "response": result
            }
            await websocket.send(json.dumps(result))

start_server = websockets.serve(hello, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
