#ifndef ROOM_MANAGER_H
#define ROOM_MANAGER_H

#include <unordered_map>
#include <string_view>
#include "defs.h"
#include "room.h"

class RoomManager final {
public:
    void create_room(uint8_t expected_player_count);
    void on_message(std::string_view message);
    void on_close();
private:
    std::unordered_map<RoomId, Room> rooms;
};

#endif // ROOM_MANAGER_H
