import Foundation

final class PlayerHistoryService {
    private let baseURL = "http://localhost:3001/api/players"
    
    func searchAndSync(gameName: String, tagLine: String) async throws -> PlayerSearchResponse {
        let escapedGameName = gameName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? gameName
        let escapedTagLine = tagLine.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? tagLine
        guard let url = URL(string: "\(baseURL)/search?gameName=\(escapedGameName)&tagLine=\(escapedTagLine)") else {
            throw URLError(.badURL)
        }
        
        let response: PlayerSearchResponse = try await APIClient.shared.fetch(url: url)
        return response
    }
    
    func fetchMatches(playerId: String) async throws -> [PlayerMatchHistory] {
        guard let url = URL(string: "\(baseURL)/\(playerId)/matches") else {
            throw URLError(.badURL)
        }
        
        let response: [PlayerMatchHistory] = try await APIClient.shared.fetch(url: url)
        return response
    }
}
