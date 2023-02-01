#ifndef UTILS_H
#define UTILS_H

#include <string>

#include "defs.h"

namespace utils {
    std::string generate_uuid4();
    GameMethod string_to_game_method(const std::string& method_key);
    PlayerEvent string_to_player_event(const std::string& player_key);
    std::string player_event_to_string(PlayerEvent event);
}

#endif // UTILS_H
