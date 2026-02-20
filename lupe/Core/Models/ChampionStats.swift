import Foundation

struct ChampionStats: Codable, Identifiable, Hashable {
    let id: Int
    let patch: String
    let championId: Int
    let championName: String
    let games: Int
    let wins: Int
    let pickRate: Double
    let winRate: Double
    let topBuilds: [ChampionTopBuild]
    let updatedAt: String?
    
    var normalizedChampionName: String {
        championName.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }
}

struct ChampionTopBuild: Codable, Hashable {
    let items: [Int]
    let count: Int
    let winRate: Double
}
