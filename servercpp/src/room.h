#ifndef ROOM_H
#define ROOM_H

#include <memory>
#include <vector>
#include <unordered_set>

#include "defs.h"
#include "command.h"

class Room final {
public:
    Room(uint8_t expected_player_count_arg);
    ~Room();

    void applyCommand(std::shared_ptr<Command> command);

    const std::string& get_id() const;
    bool get_is_game_playing() const;
    bool should_game_start() const;
    std::unordered_set<PlayerStartingPosition> get_current_starting_positions() const;
    std::string format_join_room_response(const PlayerId& player_id) const;
    std::string format_player_was_joined_response() const;
    std::string format_player_event_was_sent_response() const;
private:
    uint8_t expected_player_count = 0;
    RoomId id;
    RoomState current_state;
    std::vector<std::shared_ptr<Command>> commands;
};

#endif // ROOM_H
