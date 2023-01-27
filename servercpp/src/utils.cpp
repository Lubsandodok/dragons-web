#include "utils.h"
#include <random>
#include <sstream>

namespace utils {
    std::string generate_uuid4() {
        std::random_device rd;
        std::mt19937 generator(rd());
        std::uniform_int_distribution<int> distribution(0, 15);
        std::stringstream ss;
        ss << distribution(generator);
        return ss.str();
    }
}
