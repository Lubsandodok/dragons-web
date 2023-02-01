#include "utils.h"
#include <unordered_map>
#include <random>
#include <sstream>

namespace utils {
    std::string generate_uuid4() {
        std::random_device rd;
        std::mt19937 generator(rd());
        std::uniform_int_distribution<int> distribution(1000, 2000);
        std::stringstream ss;
        ss << distribution(generator);
        return ss.str();
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
            std::cout << "ERROR" << std::endl;
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
            {"CREATE_FIREBALL", PlayerEvent::CREATE_FIREBALL},
        };

        auto event_it = str_to_enum.find(player_key);
        if (event_it != str_to_enum.end()) {
            return event_it->second;
        } else {
            std::cout << "ERROR" << std::endl;
            return PlayerEvent::NONE;
        }
    }

    std::string player_event_to_string(PlayerEvent event) {
        static std::unordered_map<PlayerEvent, std::string> enum_to_str = {
            {PlayerEvent::NONE, "NONE"},
            {PlayerEvent::DRAGON_MOVE, "DRAGON_MOVE"},
            {PlayerEvent::DRAGON_LEFT, "DRAGON_LEFT"},
            {PlayerEvent::DRAGON_RIGHT, "DRAGON_RIGHT"},
            {PlayerEvent::CREATE_FIREBALL, "CREATE_FIREBALL"},
        };

        auto event_it = enum_to_str.find(event);
        if (event_it != enum_to_str.end()) {
            return event_it->second;
        } else {
            std::cout << "ERROR" << std::endl;
            return enum_to_str[PlayerEvent::NONE];
        }
    }
}
