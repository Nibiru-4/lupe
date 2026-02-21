import Foundation

struct PlayerSearchResponse: Codable {
    let player: PlayerProfile
    let matches: [PlayerMatchHistory]
}

struct PlayerProfile: Codable, Identifiable {
    let id: String
    let puuid: String
    let gameName: String
    let tagLine: String
    let summonerLevel: Int?
    let profileIconId: Int?
    let rankTier: String?
    let rankDivision: String?
    let rankLp: Int?
    let lastSyncedAt: String
}

struct PlayerMatchHistory: Codable, Identifiable {
    let id: Int
    let playerId: String
    let matchId: String
    let championName: String
    let win: Bool
    let kills: Int
    let deaths: Int
    let assists: Int
    let queueId: Int
    let gameDuration: Int
    let gameCreation: String
    let items: [Int]
    let blueDraft: [String]?
    let redDraft: [String]?
    
    var kda: String {
        "\(kills)/\(deaths)/\(assists)"
    }
}
