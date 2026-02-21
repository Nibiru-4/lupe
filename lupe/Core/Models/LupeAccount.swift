import Foundation

struct LupeAccount: Codable, Identifiable, Equatable {
    let id: UUID
    let email: String
    let passwordHash: String
    let gameName: String
    let tagLine: String
    let createdAt: Date
}
