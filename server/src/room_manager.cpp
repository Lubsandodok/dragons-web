#include "room_manager.h"

#include <memory>
//#include <include/json.hpp>
#include "../include/json.hpp"
#include "utils.h"

using namespace nlohmann;

std::string RoomManager::create_room(std::string_view body) {
    std::cout << "On create room" << std::endl;

    const json msg = json::parse(body);
    uint8_t expected_player_count = msg["expected_player_count"].get<uint8_t>();

    auto room = std::make_shared<Room>(expected_player_count);
    rooms[room->get_id()] = room;
    json response = {{"room_id", room->get_id()}};
    return response.dump();
}

void RoomManager::on_message(WebSocket* ws, std::string_view message) {
    const json msg = json::parse(message);
    
    if (!(msg.contains("method") && msg.contains("parameters"))) {
        std::cout << "Error. Message doesnt have parameters" << std::endl;
        return;
    }

    GameMethod method = utils::string_to_game_method(msg["method"]);
    const json& parameters = msg["parameters"];
    if (method == GameMethod::JOIN_ROOM) {
        std::cout << "On join room: " << msg << parameters.is_object() << std::endl;
        // TODO validation
        const std::string& room_id = parameters["room_id"].get<std::string>();
        auto room_it = rooms.find(room_id);
        if (room_it != rooms.end()) {
            std::shared_ptr<Room> room = room_it->second;
            PlayerId player_id = utils::generate_uuid4();
            PlayerStartingPosition player_starting_position = utils::generate_new_starting_position(
                room->get_current_starting_positions()
            );

            std::shared_ptr<CreatePlayerCommand> create_command =
                std::make_shared<CreatePlayerCommand>(ws, player_id, player_starting_position);
            room->applyCommand(create_command);

            ws->getUserData()->room_id = room_id;
            ws->getUserData()->player_id = player_id;

            std::shared_ptr<SendToOneCommand> join_room_command = std::make_shared<SendToOneCommand>(
                player_id,
                room->format_join_room_response(player_id)
            );
            room->applyCommand(join_room_command);

            if (room->should_game_start()) {
                auto start_game_command = std::make_shared<ChangeIsGamePlayingCommand>(
                    room->should_game_start()
                );
                room->applyCommand(start_game_command);
            }
            std::shared_ptr<SendToAllCommand> send_to_all_command = std::make_shared<SendToAllCommand>(
                room->format_player_was_joined_response()
            );
            room->applyCommand(send_to_all_command);
        }
    } else if (method == GameMethod::SEND_PLAYER_EVENT) {
        // TODO validation
        std::cout << "On player event" << std::endl;
        const std::string& room_id = ws->getUserData()->room_id;
        const PlayerId& player_id = ws->getUserData()->player_id;
        auto room_it = rooms.find(room_id);
        if (room_it != rooms.end()) {
            std::shared_ptr<Room> room = room_it->second;
            const std::string& event_str = parameters["event"];
            auto set_player_event_command = std::make_shared<SetPlayerEventCommand>(
                player_id,
                utils::string_to_player_event(event_str)
            );
            room->applyCommand(set_player_event_command);
        }
    }
}

void RoomManager::on_close(WebSocket* ws) {
    std::cout << "On close" << std::endl;
    const std::string& room_id = ws->getUserData()->room_id;
    const PlayerId& player_id = ws->getUserData()->player_id;
    auto room_it = rooms.find(room_id);
    if (room_it != rooms.end()) {
        std::shared_ptr<Room> room = room_it->second;
        auto remove_command = std::make_shared<RemovePlayerCommand>(player_id);
        room->applyCommand(remove_command);
    }
}

void RoomManager::on_event_loop() {
    for (auto& room_it : rooms) {
        auto room = room_it.second;
        if (room->get_is_game_playing()) {
//            std::cout << "Playing" << std::endl;
            auto tick_command = std::make_shared<SendToAllCommand>(
                room->format_player_event_was_sent_response()
            );
            room->applyCommand(tick_command);

            auto clear_command = std::make_shared<ClearPlayerEventsCommand>();
            room->applyCommand(clear_command);
        }
    }
}
