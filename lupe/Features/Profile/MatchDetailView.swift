import SwiftUI
internal import Combine

struct MatchDetailView: View {
    let playerId: String
    let matchId: String
    
    @StateObject private var viewModel = MatchDetailViewModel()
    
    private let cardColor = Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255)
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                if viewModel.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }
                
                if let detail = viewModel.detail {
                    headerCard(detail)
                    playerCard(detail)
                    teamsSection(detail)
                }
            }
            .padding()
        }
        .background(Color("BackgroundColor").ignoresSafeArea())
        .task {
            await viewModel.load(playerId: playerId, matchId: matchId)
        }
    }
    
    private func headerCard(_ detail: PlayerMatchDetailResponse) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(queueName(for: detail))
                .font(.headline)
                .foregroundColor(.white)
            Text("\(resultText(for: detail.player))  •  \(durationText(seconds: detail.gameDuration))  •  Patch \(detail.patch)")
                .foregroundColor(resultColor(for: detail.player))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardColor)
        .cornerRadius(12)
    }
    
    private func playerCard(_ detail: PlayerMatchDetailResponse) -> some View {
        let player = detail.player
        
        return VStack(alignment: .leading, spacing: 10) {
            Text("Your Performance")
                .font(.headline)
                .foregroundColor(.white)
            
            HStack(alignment: .top, spacing: 12) {
                championIcon(name: player.championName, size: 60)
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(player.kdaText)
                        .font(.title3.bold())
                        .foregroundColor(.white)
                    Text("CS \(player.cs) • Vision \(player.visionScore)")
                        .foregroundColor(.white.opacity(0.8))
                    HStack(spacing: 8) {
                        spellIcon(id: player.summoner1Id)
                        spellIcon(id: player.summoner2Id)
                        runeBadge(text: player.primaryRuneId.map(String.init) ?? "-")
                        runeBadge(text: player.secondaryStyleId.map(String.init) ?? "-")
                    }
                }
            }
            
            itemRow(items: player.items)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardColor)
        .cornerRadius(12)
    }
    
    private func teamsSection(_ detail: PlayerMatchDetailResponse) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Both Teams")
                .font(.headline)
                .foregroundColor(.white)
            
            ForEach(detail.teams) { team in
                VStack(alignment: .leading, spacing: 8) {
                    Text(team.teamId == 100 ? "Blue Team" : "Red Team")
                        .foregroundColor(team.win ? .green : .red)
                        .font(.subheadline.bold())
                    
                    ForEach(team.participants) { participant in
                        HStack(spacing: 8) {
                            championIcon(name: participant.championName, size: 30)
                            RankBadgeView(tier: participant.rankTier, size: 14)
                            
                            if let gameName = participant.riotIdGameName,
                               let tagLine = participant.riotIdTagline,
                               !gameName.isEmpty, !tagLine.isEmpty {
                                NavigationLink {
                                    PlayerHistoryView(gameName: gameName, tagLine: tagLine)
                                } label: {
                                    Text(participant.displayName)
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                        .frame(width: 82, alignment: .leading)
                                }
                                .buttonStyle(.plain)
                            } else {
                                Text(participant.displayName)
                                    .foregroundColor(.white)
                                    .lineLimit(1)
                                    .frame(width: 82, alignment: .leading)
                            }
                            
                            Text(participant.kdaText)
                                .foregroundColor(.white.opacity(0.85))
                                .frame(width: 68, alignment: .leading)
                            
                            Text("CS \(participant.cs)")
                                .foregroundColor(.white.opacity(0.75))
                                .font(.caption)
                                .frame(width: 52, alignment: .leading)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 4) {
                                    ForEach(participant.items, id: \.self) { itemId in
                                        itemIcon(id: itemId, size: 18)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.black.opacity(0.25))
                .cornerRadius(10)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(cardColor)
        .cornerRadius(12)
    }
    
    private func championIcon(name: String, size: CGFloat) -> some View {
        AsyncImage(url: Champion.championIconURL(for: name)) { phase in
            switch phase {
            case .success(let image):
                image.resizable().scaledToFill()
            default:
                Color.gray.opacity(0.2)
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    private func itemIcon(id: Int, size: CGFloat) -> some View {
        AsyncImage(url: Champion.itemIconURL(for: id)) { phase in
            switch phase {
            case .success(let image):
                image.resizable().scaledToFill()
            default:
                Color.gray.opacity(0.2)
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: 4))
    }
    
    private func spellIcon(id: Int) -> some View {
        AsyncImage(url: SummonerSpellAssets.iconURL(for: id)) { phase in
            switch phase {
            case .success(let image):
                image.resizable().scaledToFill()
            default:
                Color.gray.opacity(0.2)
            }
        }
        .frame(width: 28, height: 28)
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
    
    private func runeBadge(text: String) -> some View {
        Text(text)
            .font(.caption2.bold())
            .foregroundColor(.white.opacity(0.9))
            .padding(.horizontal, 6)
            .padding(.vertical, 4)
            .background(Color.white.opacity(0.14))
            .clipShape(RoundedRectangle(cornerRadius: 6))
    }
    
    private func itemRow(items: [Int]) -> some View {
        HStack(spacing: 6) {
            ForEach(items, id: \.self) { itemId in
                itemIcon(id: itemId, size: 28)
            }
        }
    }
    
    private func queueName(for detail: PlayerMatchDetailResponse) -> String {
        switch detail.queueId {
        case 420: return "Ranked Solo/Duo"
        case 440: return "Ranked Flex"
        case 400: return "Normal Draft"
        case 430: return "Normal Blind"
        case 450: return "ARAM"
        default: return detail.gameMode
        }
    }
    
    private func resultText(for player: MatchParticipant) -> String {
        player.win ? "WIN" : "LOSS"
    }
    
    private func resultColor(for player: MatchParticipant) -> Color {
        player.win ? .green : .red
    }
    
    private func durationText(seconds: Int) -> String {
        let minutes = seconds / 60
        let remain = seconds % 60
        return String(format: "%d:%02d", minutes, remain)
    }
}

@MainActor
private final class MatchDetailViewModel: ObservableObject {
    @Published private(set) var detail: PlayerMatchDetailResponse?
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    
    private let service = PlayerHistoryService()
    
    func load(playerId: String, matchId: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            detail = try await service.fetchMatchDetail(playerId: playerId, matchId: matchId)
        } catch {
            detail = nil
            errorMessage = "Unable to load match detail."
        }
        
        isLoading = false
    }
}

private enum SummonerSpellAssets {
    private static let version = "14.2.1"
    
    private static let spellById: [Int: String] = [
        1: "SummonerBoost",
        3: "SummonerExhaust",
        4: "SummonerFlash",
        6: "SummonerHaste",
        7: "SummonerHeal",
        11: "SummonerSmite",
        12: "SummonerTeleport",
        13: "SummonerMana",
        14: "SummonerDot",
        21: "SummonerBarrier",
        30: "SummonerPoroRecall",
        31: "SummonerPoroThrow",
        32: "SummonerSnowball"
    ]
    
    static func iconURL(for spellId: Int) -> URL? {
        guard let key = spellById[spellId] else { return nil }
        return URL(string: "https://ddragon.leagueoflegends.com/cdn/\(version)/img/spell/\(key).png")
    }
}
