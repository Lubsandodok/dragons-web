#include "command.h"

CreatePlayerCommand::CreatePlayerCommand(WebSocket* ws_arg, const PlayerId& player_id_arg)
    : ws(ws_arg), player_id(player_id_arg) {}

void CreatePlayerCommand::apply(RoomState& state) {
    state.players[player_id] = {player_id, ws, PlayerEvent::NONE};
}


