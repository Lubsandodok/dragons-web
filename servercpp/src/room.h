#ifndef ROOM_H
#define ROOM_H

#include <memory>
#include <vector>

#include "defs.h"
#include "command.h"

class Room final {
public:
    Room(uint8_t expected_player_count_arg);
    ~Room();

    void applyCommand(std::shared_ptr<Command> command);

    const std::string& getId() const;
private:
    RoomId id;
    uint8_t expected_player_count = 0;
    RoomState current_state;
    std::vector<std::shared_ptr<Command>> commands;
};

#endif // ROOM_H
