#ifndef UTILS_H
#define UTILS_H

#include <string>

#include "defs.h"

namespace utils {
    std::string generate_uuid4();
    GameMethod string_to_game_method(const std::string& method_key);
}

#endif // UTILS_H
