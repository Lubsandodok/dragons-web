#include "utils.h"
#include <unordered_map>
#include <random>
#include <sstream>

#include "plog/Log.h"

namespace utils {
    std::string generate_uuid4() {
        std::random_device rd;
        std::mt19937 generator(rd());
        std::uniform_int_distribution<int> distribution(1000, 2000);
        std::stringstream ss;
        ss << distribution(generator);
        return ss.str();
    }

    PlayerStartingPosition generate_new_starting_position(
        const std::unordered_set<PlayerStartingPosition>& current_positions
    ) {
        std::random_device rd;
        std::mt19937 generator(rd());
        std::uniform_int_distribution<uint8_t> distribution(0, 3);
        uint8_t new_position = distribution(generator);
        while (current_positions.find(static_cast<PlayerStartingPosition>(new_position)) != current_positions.end()) {
            new_position++;
            // TODO: use constant instead of hardcoded value
            if (new_position > 3) {
                new_position = 0;
            }
        }
        return static_cast<PlayerStartingPosition>(new_position);
    }

    GameMethod string_to_game_method(const std::string& method_key) {
        static std::unordered_map<std::string, GameMethod> str_to_enum = {
            {"PLAYER_EVENT_WAS_SENT", GameMethod::PLAYER_EVENT_WAS_SENT},
            {"JOIN_ROOM", GameMethod::JOIN_ROOM},
            {"PLAYER_WAS_JOINED", GameMethod::PLAYER_WAS_JOINED},
            {"SEND_PLAYER_EVENT", GameMethod::SEND_PLAYER_EVENT},
            {"FINISH_ROOM", GameMethod::FINISH_ROOM},
        };

        auto method_it = str_to_enum.find(method_key);
        if (method_it != str_to_enum.end()) {
            return method_it->second;
        } else {
            PLOG(plog::error) << "ERROR: " << method_key;
            return GameMethod::NONE;
        }
    }

    PlayerEvent string_to_player_event(const std::string& player_key) {
        // TODO - one source
        static std::unordered_map<std::string, PlayerEvent> str_to_enum = {
            {"NONE", PlayerEvent::NONE},
            {"DRAGON_MOVE", PlayerEvent::DRAGON_MOVE},
            {"DRAGON_LEFT", PlayerEvent::DRAGON_LEFT},
            {"DRAGON_RIGHT", PlayerEvent::DRAGON_RIGHT},
            {"DRAGON_TURN_BACK", PlayerEvent::DRAGON_TURN_BACK},
            {"CREATE_FIREBALL", PlayerEvent::CREATE_FIREBALL},
        };

        auto event_it = str_to_enum.find(player_key);
        if (event_it != str_to_enum.end()) {
            return event_it->second;
        } else {
            PLOG(plog::error) << "ERROR: " << player_key;
            return PlayerEvent::NONE;
        }
    }

    std::string player_event_to_string(PlayerEvent event) {
        static std::unordered_map<PlayerEvent, std::string> enum_to_str = {
            {PlayerEvent::NONE, "NONE"},
            {PlayerEvent::DRAGON_MOVE, "DRAGON_MOVE"},
            {PlayerEvent::DRAGON_LEFT, "DRAGON_LEFT"},
            {PlayerEvent::DRAGON_RIGHT, "DRAGON_RIGHT"},
            {PlayerEvent::DRAGON_TURN_BACK, "DRAGON_TURN_BACK"},
            {PlayerEvent::CREATE_FIREBALL, "CREATE_FIREBALL"},
        };

        auto event_it = enum_to_str.find(event);
        if (event_it != enum_to_str.end()) {
            return event_it->second;
        } else {
            PLOG(plog::error) << "ERROR: " << static_cast<int>(event);
            return enum_to_str[PlayerEvent::NONE];
        }
    }
}
