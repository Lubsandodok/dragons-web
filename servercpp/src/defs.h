#ifndef DEFS_H
#define DEFS_H

#include <string>
#include <unordered_map>

#include <WebSocket.h>

using PlayerId = std::string;
using RoomId = std::string;

struct PerSocketData {
    RoomId room_id;
    PlayerId player_id;
};

using WebSocket = uWS::WebSocket<false, true, PerSocketData>;

enum class PlayerEvent : uint8_t {
    NONE,
    DRAGON_MOVE,
    DRAGON_LEFT,
    DRAGON_RIGHT,
    DRAGON_TURN_BACK,
    CREATE_FIREBALL,
};

enum class PlayerStartingPosition : uint8_t {
    LEFT_HIGH,
    RIGHT_HIGH,
    LEFT_LOW,
    RIGHT_LOW,
};

enum class GameMethod : uint8_t {
    NONE,
    PLAYER_EVENT_WAS_SENT,
    JOIN_ROOM,
    PLAYER_WAS_JOINED,
    SEND_PLAYER_EVENT,
    FINISH_ROOM,
};

struct Player {
    std::string id;
    WebSocket* ws;
    PlayerStartingPosition starting_position;
    PlayerEvent event = PlayerEvent::NONE;
};

struct RoomState {
    bool is_game_plaing = false;
    std::unordered_map<PlayerId, Player> players;
};

#endif // DEFS_H
