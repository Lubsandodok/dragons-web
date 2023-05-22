#include "database.h"

#include "plog/Log.h"

namespace queries {
}

Database::Database() {
    int status = sqlite3_open("database.db", &db);
    if (status) {
        PLOG(plog::error) << "Can't open database: " << sqlite3_errmsg(db);
    } else {
        PLOG(plog::info) << "Opened database successfully";
        is_ready = check_schema();
    }
}

Database::~Database() {
    sqlite3_close(db);
}

Database& Database::get_instance() {
    static Database instance;
    return instance;
}

bool Database::check_schema() const {
    // TODO
    return true;
}
