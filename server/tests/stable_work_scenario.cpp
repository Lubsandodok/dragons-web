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
#include <array>
#include <map>
#include <vector>
#include <experimental/random>
#include <mutex>

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
    std::istream& is = session.receiveResponse(response);
    // std::cout << "->" << response.getStatus() << " " << response.getReason() << std::endl;
    
    std::stringstream ss;
    Poco::StreamCopier::copyStream(is, ss);

    std::cout << "->" << ss.str() << std::endl;

    json responseObject = json::parse(ss.str());

    return responseObject["room_id"];
}

WebSocket* create_ws_connection(const std::string& room_id) {
    HTTPClientSession session("localhost", 9001);
    HTTPRequest request(HTTPRequest::HTTP_GET, "/room/join", HTTPMessage::HTTP_1_1);
    HTTPResponse response;

    json body_to_join = {
        {"method", "JOIN_ROOM"},
        {"parameters", {{"room_id", room_id}}},
    };
    std::string message = body_to_join.dump();
    

    WebSocket* ws = new WebSocket(session, request, response);
    // dangerous place. Maybe length() is not possible to use here.
    int length = ws->sendFrame(message.c_str(), message.length(), WebSocket::FRAME_TEXT);
    // std::cout << "<-" << message << std::endl;
    
    int flags = 0;
    // int responsePayloadSize = 2000;
    Poco::Buffer<char> buffer(0);
    buffer.resize(0);
    length = ws->receiveFrame(buffer, flags);
    std::string responseString(buffer.begin(), buffer.end());
    // std::cout << "->" << "Length: " << length << "Got: " << responseString << std::endl;

    return ws;
}

void scenario_all_moves(const std::string& room_id, std::vector<std::map<std::string, std::vector<std::string>>>* all_players_moves_was_getting) {
    std::array<std::string, 5> move_array = {"NONE", "DRAGON_MOVE", "DRAGON_LEFT", "DRAGON_RIGHT", "CREATE_FIREBALL"};
    std::mutex m;
    WebSocket* ws = create_ws_connection(room_id);
    Poco::Buffer<char> buffer(0);
    int flags = 0;
    int length = 0;
    while (true) {
        buffer.resize(0);
        length = ws->receiveFrame(buffer, flags);
        std::string responseString(buffer.begin(), buffer.end());
        std::cout << "->" << "Length: " << length << "Got: " << responseString << std::endl;
        json responseObject = json::parse(responseString);
        try {
            if (responseObject["parameters"]["is_game_playing"]) {
                break;
            }
        } catch (std::exception& exc) {
            continue;
        }
    }
    
    std::map<std::string, std::vector<std::string>> players_moves;
    for (int move_num = 0; move_num < 5; move_num++) {
        int random_move = std::experimental::randint(0, 4);
        bool random_flag = true;
        json body_to_move;
        if (random_flag) {
            body_to_move = {
                {"method", "SEND_PLAYER_EVENT"},
                {"parameters", {{"event", move_array[random_move]}}},
            };
        } else {
            body_to_move = {
                {"method", "SEND_PLAYER_EVENT"},
                {"parameters", {{"event", move_array[move_num]}}},
            };
        }
        
        std::string message = body_to_move.dump();
        length = ws->sendFrame(message.c_str(), message.length(), WebSocket::FRAME_TEXT);
        // std::cout << "<-" << message << std::endl;
        
        // int responsePayloadSize = 2000;
        buffer.resize(0);
        length = ws->receiveFrame(buffer, flags);
        std::string responseString(buffer.begin(), buffer.end());
        // std::cout << "->" << "Length: " << length << "Got: " << responseString << std::endl;
        json responseObject = json::parse(responseString);
        responseObject = responseObject["parameters"]["players"];
        for (auto player_move : responseObject) {
            // std::cout << player_move << '\n';
            for (auto it = player_move.begin(); it != player_move.end(); ++it) {
                // std::cout << it.key() << " : " << it.value() << std::endl;
                if (players_moves.find(it.key()) == players_moves.end()) {
                    players_moves[it.key()] = {};
                    players_moves[it.key()].push_back(it.value());
                } else {
                    players_moves[it.key()].push_back(it.value());
            } 
            }
        } 
            
    }
    // for (const auto &vector_of_moves : players_moves) {
    //     std::cout << vector_of_moves.first << std::endl;
    //     for (int move_number = 0; move_number < vector_of_moves.second.size(); move_number++) {
    //         std::cout << ";" << vector_of_moves.second[move_number] << std::endl;    
    //     }
    // }
    m.lock();
    all_players_moves_was_getting->push_back(players_moves);
    m.unlock();

}

void print_map (std::vector<std::map<std::string, std::vector<std::string>>>* all_players_moves_was_getting) {
    int n_players = all_players_moves_was_getting->size();
    for (int i = 0; i < n_players; i++) {
        for (const auto &vector_of_moves : (*all_players_moves_was_getting)[i]) {
            std::cout << vector_of_moves.first << std::endl;
            for (int move_number = 0; move_number < vector_of_moves.second.size(); move_number++) {
                std::cout << ";" << vector_of_moves.second[move_number] << std::endl;    
            }
        }
    } 
}

std::string map_equal_test (std::vector<std::map<std::string, std::vector<std::string>>>* all_players_moves_was_getting) {
    std::string ans;
    int n_players = all_players_moves_was_getting->size();
    if (n_players < 2) {
        ans = "Not enough players";
        return ans;
    }
    std::map<std::string, std::vector<std::string>>::iterator first_element = (*all_players_moves_was_getting)[0].begin();
    int n_moves = first_element->second.size();
    for (int i = 0; i < n_players - 1; i++) {
        for(std::map<std::string, std::vector<std::string>>::iterator it = (*all_players_moves_was_getting)[i].begin(); it != (*all_players_moves_was_getting)[i].end(); ++it) {
            for(int move = 0; move < n_moves; move++) {
                std::string first_player_move = it->second[move];
                std::string second_player_move = (*all_players_moves_was_getting)[i+1][it->first][move];
                if (first_player_move != "NONE" && second_player_move != "NOVE" && first_player_move != second_player_move) {
                    ans = "different player moves";
                    return ans;
                }
            }
        }
    }
    ans = "all moves are correct";
    return ans;

}

int main(int argc, char** argv) {

    std::string room_id = create_room();

    std::vector<std::map<std::string, std::vector<std::string>>>* all_players_moves_was_getting = new std::vector<std::map<std::string, std::vector<std::string>>>();

    std::vector<std::thread> threads;
    threads.push_back(std::thread(scenario_all_moves, room_id, all_players_moves_was_getting));
    threads.push_back(std::thread(scenario_all_moves, room_id, all_players_moves_was_getting));

    for (auto& t : threads) {
        t.join();
    }
    std::cout << all_players_moves_was_getting->size() << std::endl;

    print_map(all_players_moves_was_getting);
    std::cout << map_equal_test(all_players_moves_was_getting) << std::endl;

    delete all_players_moves_was_getting;


    return 0;
}