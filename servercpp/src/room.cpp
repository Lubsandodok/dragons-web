#include "room.h"
#include "utils.h"

Room::Room(uint8_t expected_player_count_arg)
    : expected_player_count(expected_player_count_arg),
    id(utils::generate_uuid4()) {}

Room::~Room() {

}

const std::string& Room::getId() const {
    return id;
}

void Room::applyCommand(std::shared_ptr<Command> command) {
    command->apply(current_state);
    commands.push_back(command);
}
