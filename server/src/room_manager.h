#ifndef ROOM_MANAGER_H
#define ROOM_MANAGER_H

#include <unordered_map>
#include <string_view>
#include <memory>

#include "defs.h"
#include "room.h"
#include "database.h"

class RoomManager final {
public:
    RoomManager(const RoomManager&) = delete;
    RoomManager& operator=(const RoomManager&) = delete;

    static RoomManager& get_instance();
    void init(Database& db_arg);

    std::string create_room(std::string_view body);
    void on_message(WebSocket* ws, std::string_view message);
    void on_close(WebSocket* ws);
    void on_event_loop();
private:
    RoomManager() = default;

    std::unordered_map<RoomId, std::shared_ptr<Room>> rooms;
};

#endif // ROOM_MANAGER_H
