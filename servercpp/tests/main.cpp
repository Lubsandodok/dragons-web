#include <iostream>
#include <string>
#include <vector>
#include <thread>

#include <ostream>
#include "include/json.hpp"
#include "include/easywsclient.hpp"
#include "include/httplib.h"

using namespace nlohmann;
using easywsclient::WebSocket;

void handle_message(const std::string& message) {
    std::cout << message << std::endl;
}

WebSocket::pointer create_ws_connection(const std::string& room_id) {
    WebSocket::pointer ws = WebSocket::from_url("ws://localhost:9001/room/join");

    json body_to_join = {
        {"method", "JOIN_ROOM"},
        {"parameters", {{"room_id", room_id}}},
    };

    ws->send(body_to_join.dump());

    while (true) {
        ws->poll();
        ws->dispatch(handle_message);
    }
    return ws;
}

int main() {
    std::cout << "Start" << std::endl;

    httplib::Client cli("http://localhost:9001");
    cli.set_logger([] (const httplib::Request& req, const httplib::Response& res) {
        std::cout << "Log" << req.method << std::endl;
    });

    json body_to_create = {
        {"expected_player_count", 2},
    };
    std::cout << "Before" << body_to_create.dump() << std::endl;
    httplib::Result res = cli.Post("/room/create", body_to_create.dump(), "application/json");
    if (!(res && res.value().status == 200)) {
        std::cout << "Answer is not fine" << std::endl;
        return 0;
    }

    json response_body = json::parse(res->body);
    std::string room_id = response_body["room_id"];

    std::cout << "Answer: " << res->body << "Room id" << room_id << std::endl;

    std::vector<std::thread> threads;
    threads.push_back(std::thread(create_ws_connection, room_id));
    threads.push_back(std::thread(create_ws_connection, room_id));

    for (auto& t : threads) {
        t.join();
    }

    return 0;
}
