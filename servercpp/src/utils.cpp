#include "utils.h"
#include <unordered_map>
#include <random>
#include <sstream>

namespace utils {
    std::string generate_uuid4() {
        std::random_device rd;
        std::mt19937 generator(rd());
        std::uniform_int_distribution<int> distribution(0, 15);
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
}
