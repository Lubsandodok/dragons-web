#include "room_manager.h"

#include <include/json.hpp>
#include "utils.h"

using namespace nlohmann;

RoomId RoomManager::create_room(uint8_t expected_player_count) {
    RoomId room_id = utils::generate_uuid4();
    rooms[room_id] = std::shared_ptr<Room>(expected_player_count);
    return room_id;
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
        // TODO validation
        const std::string& room_id = parameters["room_id"];
        auto room_it = rooms.find(room_id);
        if (room_it != rooms.end()) {
            std::shared_ptr<Room> room = room_it->second;
            PlayerId player_id = utils::generate_uuid4();

            std::shared_ptr<CreatePlayerCommand> create_command =
                std::make_shared<CreatePlayerCommand>(ws, player_id);
            room->applyCommand(create_command);

            ws->getUserData()->room_id = room_id;
            ws->getUserData()->player_id = player_id;

            
        }
    }
}
