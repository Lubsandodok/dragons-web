#ifndef UTILS_H
#define UTILS_H

#include <string>
#include <unordered_set>

#include "defs.h"

namespace utils {
    std::string generate_uuid4();
    PlayerStartingPosition generate_new_starting_position(
        const std::unordered_set<PlayerStartingPosition>& current_positions);
    GameMethod string_to_game_method(const std::string& method_key);
    PlayerEvent string_to_player_event(const std::string& player_key);
    std::string player_event_to_string(PlayerEvent event);
}

#endif // UTILS_H
