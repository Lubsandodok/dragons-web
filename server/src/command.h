#ifndef COMMAND_H
#define COMMAND_H

#include "defs.h"

class Command {
public:
    virtual ~Command() = default;
    virtual void apply(RoomState& state) const = 0;
};

class CreatePlayerCommand final : public Command {
public:
    CreatePlayerCommand(
        WebSocket* ws_arg,
        const PlayerId& player_id_arg,
        const std::string& nickname_arg,
        const PlayerStartingPosition& player_starting_position_arg
    );
    void apply(RoomState& state) const;
private:
    WebSocket* ws;
    PlayerId player_id;
    std::string nickname;
    PlayerStartingPosition player_starting_position;
};

class SendToOneCommand final : public Command {
public:
    SendToOneCommand(const PlayerId& player_id_arg, const std::string& data_arg);
    void apply(RoomState& state) const;
private:
    PlayerId player_id;
    std::string data;
};

class SendToAllCommand final : public Command {
public:
    SendToAllCommand(const std::string& data_arg);
    void apply(RoomState& state) const;
private:
    std::string data;
};

class ChangeIsGamePlayingCommand final : public Command {
public:
    ChangeIsGamePlayingCommand(bool is_game_playing_arg);
    void apply(RoomState& state) const;
private:
    bool is_game_playing = false;
};

class SetPlayerEventCommand final : public Command {
public:
    SetPlayerEventCommand(const PlayerId& player_id, PlayerEvent event_arg);
    void apply(RoomState& state) const;
private:
    PlayerId player_id;
    PlayerEvent event;
};

class RemovePlayerCommand final : public Command {
public:
    RemovePlayerCommand(const PlayerId& player_id_arg);
    void apply(RoomState& state) const;
private:
    PlayerId player_id;
};

class ClearPlayerEventsCommand final : public Command {
public:
    void apply(RoomState& state) const;
};

class FinishRoomCommand final : public Command {
public:
    FinishRoomCommand(const PlayerId& winner_id_arg);
    void apply(RoomState& state) const;
private:
    PlayerId winner_id;
};

#endif // COMMAND_H
