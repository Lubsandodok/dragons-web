#include "command.h"

CreatePlayerCommand::CreatePlayerCommand(
    WebSocket* ws_arg,
    const PlayerId& player_id_arg,
    const PlayerStartingPosition& player_starting_position_arg
)
    : ws(ws_arg), player_id(player_id_arg), player_starting_position(player_starting_position_arg) {}

void CreatePlayerCommand::apply(RoomState& state) const {
    state.players[player_id] = {player_id, ws, player_starting_position, PlayerEvent::NONE};
}

SendToOneCommand::SendToOneCommand(const PlayerId& player_id_arg, const std::string& data_arg)
    : player_id(player_id_arg), data(data_arg) {}

void SendToOneCommand::apply(RoomState& state) const {
    auto player_it = state.players.find(player_id);
    if (player_it == state.players.end()) {
        std::cout << "ERROR" << std::endl;
        return;
    }
    player_it->second.ws->send(data, uWS::OpCode::TEXT);
}

SendToAllCommand::SendToAllCommand(const std::string& data_arg)
    : data(data_arg) {}

void SendToAllCommand::apply(RoomState& state) const {
    for (auto player : state.players) {
        player.second.ws->send(data, uWS::OpCode::TEXT);
    }
}

ChangeIsGamePlayingCommand::ChangeIsGamePlayingCommand(bool is_game_playing_arg)
    : is_game_playing(is_game_playing_arg) {}

void ChangeIsGamePlayingCommand::apply(RoomState& state) const {
    state.is_game_playing = is_game_playing;
}

SetPlayerEventCommand::SetPlayerEventCommand(const PlayerId& player_id_arg, PlayerEvent event_arg)
    : player_id(player_id_arg), event(event_arg) {}

void SetPlayerEventCommand::apply(RoomState& state) const {
    auto player_it = state.players.find(player_id);
    if (player_it == state.players.end()) {
        std::cout << "ERROR" << std::endl;
        return;
    }
    player_it->second.event = event;
}

RemovePlayerCommand::RemovePlayerCommand(const PlayerId& player_id_arg)
    : player_id(player_id_arg) {}

void RemovePlayerCommand::apply(RoomState& state) const {
    auto player_it = state.players.find(player_id);
    if (player_it != state.players.end()) {
        state.players.erase(player_it);
    }
}

void ClearPlayerEventsCommand::apply(RoomState& state) const {
    for (auto& player : state.players) {
        player.second.event = PlayerEvent::NONE;
    }
}

FinishRoomCommand::FinishRoomCommand(const PlayerId& winner_id_arg)
    : winner_id(winner_id_arg) {}

void FinishRoomCommand::apply(RoomState& state) const {
    state.winner_id = winner_id;
    state.is_game_playing = false;
    state.is_game_finished = true;
}
