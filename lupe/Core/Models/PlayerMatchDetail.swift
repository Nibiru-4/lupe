import Foundation

struct PlayerMatchDetailResponse: Codable {
    let matchId: String
    let gameCreation: String
    let gameDuration: Int
    let queueId: Int
    let gameMode: String
    let patch: String
    let player: MatchParticipant
    let teams: [MatchTeam]
}

struct MatchTeam: Codable, Identifiable {
    let teamId: Int
    let win: Bool
    let participants: [MatchParticipant]
    
    var id: Int { teamId }
}

struct MatchParticipant: Codable, Identifiable {
    let puuid: String
    let isPlayer: Bool
    let teamId: Int
    let riotIdGameName: String?
    let riotIdTagline: String?
    let summonerName: String?
    let championName: String
    let championId: Int
    let win: Bool
    let kills: Int
    let deaths: Int
    let assists: Int
    let cs: Int
    let visionScore: Int
    let summoner1Id: Int
    let summoner2Id: Int
    let primaryRuneId: Int?
    let primaryStyleId: Int?
    let secondaryStyleId: Int?
    let rankTier: String?
    let rankDivision: String?
    let rankLp: Int?
    let items: [Int]
    
    var id: String { puuid }
    
    var kdaText: String {
        "\(kills) / \(deaths) / \(assists)"
    }
    
    var displayName: String {
        if let riotIdGameName, !riotIdGameName.isEmpty {
            return riotIdGameName
        }
        if let summonerName, !summonerName.isEmpty {
            return summonerName
        }
        return "Unknown"
    }
}
