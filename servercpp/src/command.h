#ifndef COMMAND_H
#define COMMAND_H

#include "defs.h"

class Command {
public:
    Command(const std::string& room_id);
    virtual ~Command() = default;

    virtual void apply(RoomState& state) const = 0;
private:
    std::string room_id;
};

class StartRoomCommand final : public Command {
public:
    StartRoomCommand(const std::string& room_id, bool is_game_playing);

    void apply(RoomState& state);
private:
    bool is_game_playing = false;
};

#endif // COMMAND_H
