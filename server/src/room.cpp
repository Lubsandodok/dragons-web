#include "room.h"
#include "utils.h"
#include "../include/json.hpp"

using namespace nlohmann;

Room::Room(uint8_t expected_player_count_arg)
    : expected_player_count(expected_player_count_arg),
    id(utils::generate_uuid4()) {}

Room::~Room() {

}

void Room::applyCommand(std::shared_ptr<Command> command) {
    command->apply(current_state);
    commands.push_back(command);
}

const std::string& Room::get_id() const {
    return id;
}

bool Room::get_is_game_playing() const {
    return current_state.is_game_playing;
}

bool Room::should_game_start() const {
    return current_state.players.size() == expected_player_count;
}

std::unordered_set<PlayerStartingPosition> Room::get_current_starting_positions() const {
    std::unordered_set<PlayerStartingPosition> positions;
    for (const auto& id_player : current_state.players) {
        positions.insert(id_player.second.starting_position);
    }
    return positions;
}

std::string Room::format_join_room_response(const PlayerId& player_id) const {
    // TODO result -> parameters
    std::cout << "format_join_room_response-start" << std::endl;
    json response = {
        {"method", "JOIN_ROOM"},
        {"result", {{"your_player", player_id}}},
    };
    std::cout << "format_join_room_response-end" << std::endl;
    return response.dump();
}

std::string Room::format_player_was_joined_response() const {
    std::cout << "format_player_was_joined_response-start" << std::endl;
    json response = {
        {"method", "PLAYER_WAS_JOINED"},
        {"parameters", {
            {"is_game_playing", current_state.is_game_playing},
            {"players", json::array()},
        }},
    };
    for (const auto& id_player : current_state.players) {
        json player = {
            {"id", id_player.first},
            {"nickname", id_player.second.nickname},
            {"starting_position", static_cast<uint8_t>(id_player.second.starting_position)},
        };
        response["parameters"]["players"].push_back(player);
    }
    std::cout << "format_player_was_joined_response-end" << std::endl;
    return response.dump();
}

std::string Room::format_player_event_was_sent_response() const {
    json response = {
        {"method", "PLAYER_EVENT_WAS_SENT"},
        {"parameters", {
            {"players", json::array()},
        }},
    };
    for (const auto& id_player : current_state.players) {
        std::string event = utils::player_event_to_string(id_player.second.event);
        response["parameters"]["players"].push_back({{id_player.first, event}});
    }
    std::cout << "Loop: " << response.dump() << std::endl;
    return response.dump();
}
