#ifndef DATABASE_H
#define DATABASE_H

#include <sqlite3.h>

class Database final {
public:
    Database(const Database&) = delete;
    Database& operator=(const Database&) = delete;

    static Database& get_instance();

    void create_player();
private:
    Database();
    ~Database();

    bool check_schema() const;

    sqlite3* db = nullptr;
    bool is_ready = false;
};

#endif // DATABASE_H
