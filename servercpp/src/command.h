#ifndef COMMAND_H
#define COMMAND_H

#include "defs.h"

class Command {
public:
    virtual ~Command() = default;

    virtual void apply(RoomState& state) const = 0;
};

class CreatePlayerCommand final : public Command {
public:
    CreatePlayerCommand(WebSocket* ws_arg, const PlayerId& player_id_arg);

    void apply(RoomState& state);
private:
    WebSocket* ws;
    PlayerId player_id;
};

class StartRoomCommand final : public Command {
public:
    StartRoomCommand(const std::string& room_id, bool is_game_playing);

    void apply(RoomState& state);
private:
    bool is_game_playing = false;
};

#endif // COMMAND_H
