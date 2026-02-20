import Foundation

final class ChampionStatsService {
    private let baseURL = "http://localhost:3001/api/stats/champions"
    
    func fetchChampionStats() async throws -> [ChampionStats] {
        guard let url = URL(string: baseURL) else {
            throw URLError(.badURL)
        }
        
        let response: [ChampionStats] = try await APIClient.shared.fetch(url: url)
        return response
    }
    
    func fetchChampionStats(for championName: String) async throws -> ChampionStats? {
        let escapedName = championName.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? championName
        guard let url = URL(string: "\(baseURL)/\(escapedName)") else {
            throw URLError(.badURL)
        }
        
        return try await APIClient.shared.fetch(url: url)
    }
}
