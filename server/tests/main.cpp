#include <exception>
#include <iostream>
#include <sstream>
#include <thread>

#include <Poco/Net/HTTPRequest.h>
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPMessage.h>
#include <Poco/Net/WebSocket.h>
#include <Poco/Net/HTTPClientSession.h>
#include <Poco/Buffer.h>
#include <Poco/StreamCopier.h>
#include <string>

#include "include/json.hpp"

using namespace Poco::Net;
using namespace nlohmann;

std::string create_room() {
    HTTPClientSession session("localhost", 9001);
    HTTPRequest request(HTTPRequest::HTTP_POST, "/room/create", HTTPMessage::HTTP_1_1);

    json body_to_create = {{"expected_player_count", 2}};

    request.setContentType("application/json");
    request.setContentLength(body_to_create.dump().length());

    std::ostream& os = session.sendRequest(request);
    os << body_to_create.dump();

    HTTPResponse response;
    std::cout << response.getStatus() << " " << response.getReason() << std::endl;

    std::istream& is = session.receiveResponse(response);
    std::stringstream ss;
    Poco::StreamCopier::copyStream(is, ss);

    std::cout << ss.str() << std::endl;

    json responseObject = json::parse(ss.str());

    return responseObject["room_id"];
}

void create_ws_connection_with_moves(const std::string& room_id) {
    HTTPClientSession session("localhost", 9001);
    HTTPRequest request(HTTPRequest::HTTP_GET, "/room/join", HTTPMessage::HTTP_1_1);
    HTTPResponse response;

    json body_to_join = {
        {"method", "JOIN_ROOM"},
        {"parameters", {{"room_id", room_id}}},
    };
    std::string message = body_to_join.dump();
    

    json body_to_move = {
        {"method", "SEND_PLAYER_EVENT"},
        {"parameters", {{"event", "DRAGON_MOVE"}}},
    };
    std::string message_move = body_to_move.dump();
    // std::cout << message_move << std::endl;

    try {
        WebSocket* ws = new WebSocket(session, request, response);
        // dangerous place. Maybe length() is not possible to use here.
        int length = ws->sendFrame(message.c_str(), message.length(), WebSocket::FRAME_TEXT);
        std::cout << "<-" << message << std::endl;
        int flags = 0;

        int responsePayloadSize = 2000;
        Poco::Buffer<char> buffer(0);
        while (true) {
            buffer.resize(0);
            length = ws->sendFrame(message_move.c_str(), message_move.length(), WebSocket::FRAME_TEXT);
            length = ws->receiveFrame(buffer, flags);
            // if (length != 0) {
            //     std::string responseString(buffer.begin(), buffer.end());
            //     std::cout << "Length: " << length << "Got: " << responseString << std::endl;
            // }
        }

    } catch (std::exception& exc) {
        std::cout << "Exception: " << exc.what() << std::endl;
    }
}

void create_ws_connection(const std::string& room_id) {
    HTTPClientSession session("localhost", 9001);
    HTTPRequest request(HTTPRequest::HTTP_GET, "/room/join", HTTPMessage::HTTP_1_1);
    HTTPResponse response;

    json body_to_join = {
        {"method", "JOIN_ROOM"},
        {"parameters", {{"room_id", room_id}}},
    };
    std::string message = body_to_join.dump();
    std::cout << "<-" << message << std::endl;

    try {
        WebSocket* ws = new WebSocket(session, request, response);
        // dangerous place. Maybe length() is not possible to use here.
        int length = ws->sendFrame(message.c_str(), message.length(), WebSocket::FRAME_TEXT);
        int flags = 0;

        int responsePayloadSize = 2000;
        Poco::Buffer<char> buffer(0);
        while (true) {
            buffer.resize(0);
            length = ws->receiveFrame(buffer, flags);
            if (length != 0) {
                std::string responseString(buffer.begin(), buffer.end());
                std::cout << "->" << "Length: " << length << "Got: " << responseString << std::endl;
            }
        }

    } catch (std::exception& exc) {
        std::cout << "Exception: " << exc.what() << std::endl;
    }
}

int main(int argc, char** argv) {

    std::string room_id = create_room();

    std::vector<std::thread> threads;
    threads.push_back(std::thread(create_ws_connection_with_moves, room_id));
    threads.push_back(std::thread(create_ws_connection, room_id));

    for (auto& t : threads) {
        t.join();
    }

    return 0;
}
