#ifndef ROOM_H
#define ROOM_H

#include <memory>
#include <vector>

#include "defs.h"
#include "command.h"

class Room final {
public:
    Room(uint8_t expected_player_count);
    ~Room() = default;

    void applyCommand(std::unique_ptr<Command> command);

    const std::string& getId() const;
private:
    RoomId id;
    uint8_t expected_player_count = 0;
    RoomState state;
    std::vector<std::unique_ptr<Command>> commands;
};

#endif // ROOM_H
