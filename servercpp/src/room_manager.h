#ifndef ROOM_MANAGER_H
#define ROOM_MANAGER_H

#include <unordered_map>
#include <string_view>
#include <memory>

#include "defs.h"
#include "room.h"

class RoomManager final {
public:
    RoomId create_room(uint8_t expected_player_count);
    void on_message(WebSocket* ws, std::string_view message);
    void on_close(WebSocket* ws);
private:
    std::unordered_map<RoomId, std::shared_ptr<Room>> rooms;
};

#endif // ROOM_MANAGER_H
